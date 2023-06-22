import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerStoryLink, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/get";
import { ERelation } from "@/engine/core/utils/relation/types";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerGroupObject } from "@/engine/lib/types";
import { MockAlifeSimulator, mockServerAlifeCreatureActor, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("'relation/get' utils", () => {
  beforeEach(() => {
    registry.actor = null as any;
    registry.storyLink.sidById = new LuaTable();
    registry.storyLink.idBySid = new LuaTable();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
  });

  it("'getObjectsRelationSafe' should correctly check relation", () => {
    // todo;
  });

  it("'getSquadRelationToActor' should correctly check relation", () => {
    // todo;
  });

  it("'getSquadMembersRelationToActor' should correctly check relation", () => {
    // todo;
  });

  it("'getNumberRelationBetweenCommunities' should correctly check relation", () => {
    // todo;
  });

  it("'getSquadCommunityRelationToActor' should correctly get realation of squad community", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    mockServerAlifeCreatureActor({ community: () => communities.actor });

    const enemy: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const friend: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const neutral: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const predefined: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (enemy as Squad).getCommunity = () => communities.monolith;
    (friend as Squad).getCommunity = () => communities.army;
    (neutral as Squad).getCommunity = () => communities.stalker;

    registerStoryLink(enemy.id, "existing-enemy");
    registerStoryLink(friend.id, "existing-friend");
    registerStoryLink(neutral.id, "existing-neutral");
    registerStoryLink(predefined.id, "existing-predefined");

    (predefined as Squad).relationship = ERelation.ENEMY;
    expect(getSquadCommunityRelationToActor("existing-predefined")).toBe(ERelation.ENEMY);
    (predefined as Squad).relationship = ERelation.FRIEND;
    expect(getSquadCommunityRelationToActor("existing-predefined")).toBe(ERelation.FRIEND);
    (predefined as Squad).relationship = ERelation.NEUTRAL;
    expect(getSquadCommunityRelationToActor("existing-predefined")).toBe(ERelation.NEUTRAL);

    expect(getSquadCommunityRelationToActor("existing-friend")).toBe(ERelation.FRIEND);
    expect(getSquadCommunityRelationToActor("existing-neutral")).toBe(ERelation.NEUTRAL);
    expect(getSquadCommunityRelationToActor("existing-enemy")).toBe(ERelation.ENEMY);
  });

  it("'getSquadRelationToActorById' should correctly check relation", () => {
    // todo;
  });
});
