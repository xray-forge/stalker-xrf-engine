import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'relation' conditions declaration", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["xr_conditions"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/relation");

    checkBinding("is_factions_enemies");
    checkBinding("is_factions_neutrals");
    checkBinding("is_factions_friends");
    checkBinding("is_faction_enemy_to_actor");
    checkBinding("is_faction_friend_to_actor");
    checkBinding("is_faction_neutral_to_actor");
    checkBinding("is_squad_friend_to_actor");
    checkBinding("is_squad_enemy_to_actor");
    checkBinding("is_squad_neutral_to_actor");
    checkBinding("fighting_actor");
  });
});
