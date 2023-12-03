import { jest } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerGroupObject, ServerHumanObject, TClassId, TName, TRate, TSection } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import {
  MockAlifeOnlineOfflineGroup,
  MockGameObject,
  mockServerAlifeHumanStalker,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";
import { mockCharactersGoodwill } from "@/fixtures/xray/mocks/relations/communityRelations.mocks";

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
  ): Squad {
    const squad: MockSquad = new MockSquad(section);

    squad.behaviour = behaviour;
    squad.simulationProperties = simulationProperties;

    return squad;
  }
}

/**
 * Mock squad record based on online-offline group for testing.
 */
export function mockSquad({
  behaviour = MockLuaTable.mock([
    ["a", "4"],
    ["c", "3"],
  ]),
  simulationProperties = MockLuaTable.mockFromObject<TName, TRate>({ a: 1, c: 2 }),
  clsid = jest.fn(() => -1 as TClassId),
  isValidSquadTarget = () => true,
  ...rest
}: Partial<Squad> = {}): Squad {
  return mockServerAlifeOnlineOfflineGroup({
    ...rest,
    simulationProperties: simulationProperties,
    clsid,
    isValidSquadTarget: isValidSquadTarget,
    assignToSmartTerrain: rest.assignToSmartTerrain ?? jest.fn(),
    isSquadArrived: rest.isSquadArrived ?? jest.fn(),
    isSimulationAvailable: rest.isSimulationAvailable ?? jest.fn(() => true),
    behaviour,
  } as Partial<ServerGroupObject>) as unknown as Squad;
}

/**
 * Mocked squads.
 */
export interface IMockedSquads {
  emptyMonolithSquad: Squad;
  emptyArmySquad: Squad;
  friendlySquad: Squad;
  neutralSquad: Squad;
  mixedSquad: Squad;
  enemySquad: Squad;
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
  const emptyMonolithSquad: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
  const emptyArmySquad: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
  const friendlySquad: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
  const neutralSquad: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
  const mixedSquad: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
  const enemySquad: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");

  const friend: ServerHumanObject = mockServerAlifeHumanStalker();
  const enemy: ServerHumanObject = mockServerAlifeHumanStalker();
  const neutral: ServerHumanObject = mockServerAlifeHumanStalker();
  const almostEnemy: ServerHumanObject = mockServerAlifeHumanStalker();
  const almostFriend: ServerHumanObject = mockServerAlifeHumanStalker();

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

  jest.spyOn(emptyMonolithSquad, "getCommunity").mockImplementation(() => communities.monolith);
  jest.spyOn(emptyArmySquad, "getCommunity").mockImplementation(() => communities.army);
  jest.spyOn(friendlySquad, "getCommunity").mockImplementation(() => communities.army);
  jest.spyOn(enemySquad, "getCommunity").mockImplementation(() => communities.monster);
  jest.spyOn(neutralSquad, "getCommunity").mockImplementation(() => communities.stalker);
  jest.spyOn(mixedSquad, "getCommunity").mockImplementation(() => communities.bandit);

  [emptyMonolithSquad, emptyArmySquad, friendlySquad, enemySquad, neutralSquad, mixedSquad].forEach((it) => {
    jest.spyOn(it, "updateSquadRelationToActor").mockImplementation(() => {});
  });

  friendlySquad.addSquadMember(friend);
  friendlySquad.addSquadMember(friend);
  friendlySquad.addSquadMember(friend);

  neutralSquad.addSquadMember(neutral);
  neutralSquad.addSquadMember(almostEnemy);
  neutralSquad.addSquadMember(almostFriend);

  enemySquad.addSquadMember(enemy);
  enemySquad.addSquadMember(enemy);

  mixedSquad.addSquadMember(friend);
  mixedSquad.addSquadMember(enemy);

  return {
    emptyMonolithSquad: emptyMonolithSquad.asSquad(),
    emptyArmySquad: emptyArmySquad.asSquad(),
    friendlySquad: friendlySquad.asSquad(),
    mixedSquad: mixedSquad.asSquad(),
    enemySquad: enemySquad.asSquad(),
    neutralSquad: neutralSquad.asSquad(),
    friend,
    enemy,
    neutral,
    almostEnemy,
    almostFriend,
  };
}
