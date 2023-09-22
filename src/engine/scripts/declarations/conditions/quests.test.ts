import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";
describe("quests conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/quests");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("zat_b29_anomaly_has_af");
    checkXrCondition("jup_b221_who_will_start");
    checkXrCondition("pas_b400_actor_far_forward");
    checkXrCondition("pas_b400_actor_far_backward");
    checkXrCondition("pri_a28_actor_is_far");
    checkXrCondition("jup_b25_senya_spawn_condition");
    checkXrCondition("jup_b25_flint_gone_condition");
    checkXrCondition("zat_b103_actor_has_needed_food");
    checkXrCondition("zat_b29_rivals_dialog_precond");
    checkXrCondition("jup_b202_actor_treasure_not_in_steal");
    checkXrCondition("jup_b47_npc_online");
    checkXrCondition("zat_b7_is_night");
    checkXrCondition("zat_b7_is_late_attack_time");
    checkXrCondition("jup_b202_inventory_box_empty");
    checkXrCondition("jup_b16_is_zone_active");
    checkXrCondition("is_jup_a12_mercs_time");
  });
});
