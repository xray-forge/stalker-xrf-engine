import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";
describe("'quests' conditions declaration", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["xr_conditions"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/quests");

    checkBinding("zat_b29_anomaly_has_af");
    checkBinding("jup_b221_who_will_start");
    checkBinding("pas_b400_actor_far_forward");
    checkBinding("pas_b400_actor_far_backward");
    checkBinding("pri_a28_actor_is_far");
    checkBinding("jup_b25_senya_spawn_condition");
    checkBinding("jup_b25_flint_gone_condition");
    checkBinding("zat_b103_actor_has_needed_food");
    checkBinding("zat_b29_rivals_dialog_precond");
    checkBinding("jup_b202_actor_treasure_not_in_steal");
    checkBinding("jup_b47_npc_online");
    checkBinding("zat_b7_is_night");
    checkBinding("zat_b7_is_late_attack_time");
    checkBinding("jup_b202_inventory_box_empty");
    checkBinding("jup_b16_is_zone_active");
  });
});
