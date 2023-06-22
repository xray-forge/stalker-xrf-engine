import { jest } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerHumanObject } from "@/engine/lib/types";
import { MockAlifeOnlineOfflineGroup, mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";
import { mockCharactersGoodwill } from "@/fixtures/xray/mocks/relations/communityRelations.mocks";

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

  registerObject(mockClientGameObject({ idOverride: friend.id }));
  registerObject(mockClientGameObject({ idOverride: enemy.id }));
  registerObject(mockClientGameObject({ idOverride: neutral.id }));
  registerObject(mockClientGameObject({ idOverride: almostEnemy.id }));
  registerObject(mockClientGameObject({ idOverride: almostFriend.id }));

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

  friendlySquad.addSquadMember(friend);
  friendlySquad.addSquadMember(friend);
  friendlySquad.addSquadMember(friend);

  neutralSquad.addSquadMember(neutral);
  neutralSquad.addSquadMember(almostEnemy);
  neutralSquad.addSquadMember(almostFriend);

  enemySquad.addSquadMember(enemy);
  enemySquad.addSquadMember(enemy);

  mixedSquad.addSquadMember(friend);
  mixedSquad.addSquadMember(neutral);
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
