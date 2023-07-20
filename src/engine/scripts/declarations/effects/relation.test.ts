import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("'relation' effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/relation");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("actor_friend");
    checkXrEffect("actor_neutral");
    checkXrEffect("actor_enemy");
    checkXrEffect("set_squad_neutral_to_actor");
    checkXrEffect("set_squad_friend_to_actor");
    checkXrEffect("set_squad_enemy_to_actor");
    checkXrEffect("set_npc_sympathy");
    checkXrEffect("set_squad_goodwill");
    checkXrEffect("set_squad_goodwill_to_npc");
    checkXrEffect("inc_faction_goodwill_to_actor");
    checkXrEffect("dec_faction_goodwill_to_actor");
    checkXrEffect("set_squads_enemies");
  });
});
