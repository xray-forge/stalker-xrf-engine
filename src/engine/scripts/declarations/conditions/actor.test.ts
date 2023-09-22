import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("actor conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/actor");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("wealthy_functor");
    checkXrCondition("information_dealer_functor");
    checkXrCondition("actor_in_surge_cover");
    checkXrCondition("is_enemy_actor");
    checkXrCondition("actor_alive");
    checkXrCondition("actor_see_npc");
    checkXrCondition("npc_in_actor_frustum");
    checkXrCondition("dist_to_actor_le");
    checkXrCondition("dist_to_actor_ge");
    checkXrCondition("actor_health_le");
    checkXrCondition("actor_in_zone");
    checkXrCondition("heli_see_actor");
    checkXrCondition("actor_has_item");
    checkXrCondition("actor_has_item_count");
    checkXrCondition("hit_by_actor");
    checkXrCondition("killed_by_actor");
    checkXrCondition("actor_has_weapon");
    checkXrCondition("actor_active_detector");
    checkXrCondition("actor_on_level");
    checkXrCondition("talking");
    checkXrCondition("actor_nomove_nowpn");
    checkXrCondition("actor_has_nimble_weapon");
    checkXrCondition("actor_has_active_nimble_weapon");
  });
});
