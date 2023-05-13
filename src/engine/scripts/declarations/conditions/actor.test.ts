import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'actor' conditions declaration", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["xr_conditions"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/actor");

    checkBinding("wealthy_functor");
    checkBinding("information_dealer_functor");
    checkBinding("actor_in_surge_cover");
    checkBinding("is_enemy_actor");
    checkBinding("actor_alive");
    checkBinding("actor_see_npc");
    checkBinding("npc_in_actor_frustum");
    checkBinding("dist_to_actor_le");
    checkBinding("dist_to_actor_ge");
    checkBinding("actor_health_le");
    checkBinding("actor_in_zone");
    checkBinding("heli_see_actor");
    checkBinding("actor_has_item");
    checkBinding("actor_has_item_count");
    checkBinding("hit_by_actor");
    checkBinding("killed_by_actor");
    checkBinding("actor_has_weapon");
    checkBinding("actor_active_detector");
    checkBinding("actor_on_level");
    checkBinding("talking");
    checkBinding("actor_nomove_nowpn");
    checkBinding("actor_has_nimble_weapon");
    checkBinding("actor_has_active_nimble_weapon");
  });
});
