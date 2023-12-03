import { jest } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  ServerCreatureObject,
  ServerGroupObject,
  ServerHumanObject,
  TClassId,
  TName,
  TNumberId,
  TRate,
  TSection,
} from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import {
  MockAlifeHumanStalker,
  MockAlifeOnlineOfflineGroup,
  mockCharactersGoodwill,
  MockGameObject,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

/**
 * Class based mock of squad group.
 */
export class MockSquad extends Squad {
  public static mock(
    section: TSection = "test_squad",
    {
      simulationProperties = MockLuaTable.mockFromObject<TName, TRate>({ a: 1, c: 2 }),
      behaviour = MockLuaTable.mock([
        ["a", "4"],
        ["c", "3"],
      ]),
    }: Partial<Squad> = {}
  ): MockSquad {
    const squad: MockSquad = new MockSquad(section);

    squad.behaviour = behaviour;
    squad.simulationProperties = simulationProperties;

    return squad;
  }

  public mockAddMember(object: ServerCreatureObject): void {
    super.register_member(object.id);

    object.group_id = this.id;
  }

  public mockSetOnline(isOnline: boolean): void {
    (this as unknown as MockAlifeOnlineOfflineGroup).online = isOnline;
  }

  public mockSetGameVertexId(id: TNumberId): void {
    (this as unknown as MockAlifeOnlineOfflineGroup).m_game_vertex_id = id;
  }
}

/**
 * Mock squad record based on online-offline group for testing.
 *
 * @deprecated
 */
export function mockSquad({
  behaviour = MockLuaTable.mock([
    ["a", "4"],
    ["c", "3"],
  ]),
  simulationProperties = MockLuaTable.mockFromObject<TName, TRate>({ a: 1, c: 2 }),
  clsid = jest.fn(() => -1 as TClassId),
  isValidSimulationTarget = () => true,
  ...rest
}: Partial<Squad> = {}): Squad {
  return mockServerAlifeOnlineOfflineGroup({
    ...rest,
    simulationProperties: simulationProperties,
    clsid,
    isValidSimulationTarget: isValidSimulationTarget,
    assignToSmartTerrain: rest.assignToSmartTerrain ?? jest.fn(),
    isSquadArrived: rest.isReachedBySimulationObject ?? jest.fn(),
    isSimulationAvailable: rest.isSimulationAvailable ?? jest.fn(() => true),
    behaviour,
  } as Partial<ServerGroupObject>) as unknown as Squad;
}

/**
 * Mocked squads.
 */
export interface IMockedSquads {
  emptyMonolithSquad: MockSquad;
  emptyArmySquad: MockSquad;
  friendlySquad: MockSquad;
  neutralSquad: MockSquad;
  mixedSquad: MockSquad;
  enemySquad: MockSquad;
  friend: ServerHumanObject;
  enemy: ServerHumanObject;
  neutral: ServerHumanObject;
  almostEnemy: ServerHumanObject;
  almostFriend: ServerHumanObject;
}

/**
 * Mocked squads with different relations.
 */
export function mockRelationsSquads(): IMockedSquads {
  const emptyMonolithSquad: MockSquad = MockSquad.mock();
  const emptyArmySquad: MockSquad = MockSquad.mock();
  const friendlySquad: MockSquad = MockSquad.mock();
  const neutralSquad: MockSquad = MockSquad.mock();
  const mixedSquad: MockSquad = MockSquad.mock();
  const enemySquad: MockSquad = MockSquad.mock();

  const friend: ServerHumanObject = MockAlifeHumanStalker.mock();
  const enemy: ServerHumanObject = MockAlifeHumanStalker.mock();
  const neutral: ServerHumanObject = MockAlifeHumanStalker.mock();
  const almostEnemy: ServerHumanObject = MockAlifeHumanStalker.mock();
  const almostFriend: ServerHumanObject = MockAlifeHumanStalker.mock();

  registerObject(MockGameObject.mock({ idOverride: friend.id }));
  registerObject(MockGameObject.mock({ idOverride: enemy.id }));
  registerObject(MockGameObject.mock({ idOverride: neutral.id }));
  registerObject(MockGameObject.mock({ idOverride: almostEnemy.id }));
  registerObject(MockGameObject.mock({ idOverride: almostFriend.id }));

  mockCharactersGoodwill(friend.id, ACTOR_ID, 1000);
  mockCharactersGoodwill(enemy.id, ACTOR_ID, -1000);
  mockCharactersGoodwill(neutral.id, ACTOR_ID, 0);
  mockCharactersGoodwill(almostEnemy.id, ACTOR_ID, -999);
  mockCharactersGoodwill(almostFriend.id, ACTOR_ID, 999);

  emptyMonolithSquad.faction = communities.monolith;
  emptyArmySquad.faction = communities.army;
  friendlySquad.faction = communities.army;
  enemySquad.faction = communities.monster;
  neutralSquad.faction = communities.stalker;
  mixedSquad.faction = communities.bandit;

  friendlySquad.mockAddMember(friend);
  friendlySquad.mockAddMember(friend);
  friendlySquad.mockAddMember(friend);

  neutralSquad.mockAddMember(neutral);
  neutralSquad.mockAddMember(almostEnemy);
  neutralSquad.mockAddMember(almostFriend);

  enemySquad.mockAddMember(enemy);
  enemySquad.mockAddMember(enemy);

  mixedSquad.mockAddMember(friend);
  mixedSquad.mockAddMember(enemy);

  return {
    emptyMonolithSquad,
    emptyArmySquad,
    friendlySquad,
    mixedSquad,
    enemySquad,
    neutralSquad,
    friend,
    enemy,
    neutral,
    almostEnemy,
    almostFriend,
  };
}
