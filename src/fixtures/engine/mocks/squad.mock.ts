import { registerObject } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ServerCreatureObject, TClassId, TName, TNumberId, TRate, TSection } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockClsid } from "@/fixtures/xray/mocks/constants/clsid.mock";
import { MockGameObject } from "@/fixtures/xray/mocks/objects/game/game_object.mock";
import { MockServerAlifeCreatureAbstract } from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";
import { MockAlifeHumanStalker } from "@/fixtures/xray/mocks/objects/server/cse_alife_human_stalker.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";
import { MockAlifeOnlineOfflineGroup } from "@/fixtures/xray/mocks/objects/server/cse_alife_online_offline_group.mock";
import { mockCharactersGoodwill } from "@/fixtures/xray/mocks/relations";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

interface IMockSquadConfig extends IMockAlifeObjectConfig {
  behaviour?: LuaTable<string, string>;
  simulationProperties?: LuaTable<TName, TRate>;
}

/**
 * Class based mock of squad group.
 */
export class MockSquad extends Squad {
  public static mock(config: IMockSquadConfig = {}): MockSquad {
    return new MockSquad(config);
  }

  public static mockRegistered(config: IMockSquadConfig = {}): Squad {
    const squad: Squad = MockSquad.mock(config);

    squad.on_before_register();
    squad.on_register();

    return squad;
  }

  public constructor(config: IMockSquadConfig) {
    const section: TSection = config.section ?? "test_squad";

    super(section);

    const object: MockAlifeOnlineOfflineGroup = this as unknown as MockAlifeOnlineOfflineGroup;

    object.classId = mockClsid.online_offline_group_s as TClassId;
    object.m_game_vertex_id = config.gameVertexId ?? 512;
    object.m_level_vertex_id = config.levelVertexId ?? 255;
    object.m_story_id = config.storyId ?? -1;
    object.position = config.position ?? MockVector.mock(0, 0, 0);
    object.section = section;

    this.behaviour =
      config.behaviour ??
      MockLuaTable.mock([
        ["a", "4"],
        ["c", "3"],
      ]);
    this.simulationProperties =
      config.simulationProperties ??
      MockLuaTable.mock([
        ["a", 1],
        ["c", 2],
      ]);
  }

  public mockAddMember(object: ServerCreatureObject | MockServerAlifeCreatureAbstract): void {
    super.register_member(object.id);

    object.group_id = this.id;
  }

  public mockRemoveMember(object: ServerCreatureObject | MockServerAlifeCreatureAbstract): void {
    super.unregister_member(object.id);

    object.group_id = MAX_U16;
  }

  public mockSetOnline(isOnline: boolean): void {
    (this as unknown as MockAlifeOnlineOfflineGroup).online = isOnline;
  }

  public mockSetGameVertexId(id: TNumberId): void {
    (this as unknown as MockAlifeOnlineOfflineGroup).m_game_vertex_id = id;
  }
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
  friend: MockAlifeHumanStalker;
  enemy: MockAlifeHumanStalker;
  neutral: MockAlifeHumanStalker;
  almostEnemy: MockAlifeHumanStalker;
  almostFriend: MockAlifeHumanStalker;
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

  const friend: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
  const enemy: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
  const neutral: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
  const almostEnemy: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
  const almostFriend: MockAlifeHumanStalker = MockAlifeHumanStalker.create();

  registerObject(MockGameObject.mock({ id: friend.id }));
  registerObject(MockGameObject.mock({ id: enemy.id }));
  registerObject(MockGameObject.mock({ id: neutral.id }));
  registerObject(MockGameObject.mock({ id: almostEnemy.id }));
  registerObject(MockGameObject.mock({ id: almostFriend.id }));

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
