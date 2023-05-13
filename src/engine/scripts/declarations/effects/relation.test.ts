import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'relation' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/relation");

    checkBinding("actor_friend");
    checkBinding("actor_neutral");
    checkBinding("actor_enemy");
    checkBinding("set_squad_neutral_to_actor");
    checkBinding("set_squad_friend_to_actor");
    checkBinding("set_squad_enemy_to_actor");
    checkBinding("set_npc_sympathy");
    checkBinding("set_squad_goodwill");
    checkBinding("set_squad_goodwill_to_npc");
    checkBinding("inc_faction_goodwill_to_actor");
    checkBinding("dec_faction_goodwill_to_actor");
  });
});
