import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("'relation' conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/relation");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("is_factions_enemies");
    checkXrCondition("is_factions_neutrals");
    checkXrCondition("is_factions_friends");
    checkXrCondition("is_faction_enemy_to_actor");
    checkXrCondition("is_faction_friend_to_actor");
    checkXrCondition("is_faction_neutral_to_actor");
    checkXrCondition("is_squad_friend_to_actor");
    checkXrCondition("is_squad_enemy_to_actor");
    checkXrCondition("fighting_actor");
    checkXrCondition("actor_enemy");
    checkXrCondition("actor_friend");
    checkXrCondition("actor_neutral");
    checkXrCondition("npc_community");
  });
});
