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

describe("quests conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/quests");
  });

  it.todo("zat_b29_anomaly_has_af should check anomaly and artefact");

  it.todo("jup_b221_who_will_start should check start object");

  it.todo("pas_b400_actor_far_forward should check actor state");

  it.todo("pas_b400_actor_far_backward should check actor state");

  it.todo("pri_a28_actor_is_far should check actor state");

  it.todo("jup_b25_senya_spawn_condition should check alcoholic spawn condition");

  it.todo("jup_b25_flint_gone_condition should check flint gone condition");

  it.todo("zat_b103_actor_has_needed_food should check actor inventory");

  it.todo("zat_b29_rivals_dialog_precond should check dialog condition");

  it.todo("jup_b202_actor_treasure_not_in_steal should check treasure state");

  it.todo("jup_b47_npc_online should check npc online state");

  it.todo("zat_b7_is_night should check day state");

  it.todo("zat_b7_is_late_attack_time should check day state");

  it.todo("jup_b202_inventory_box_empty should check box state");

  it.todo("jup_b16_is_zone_active should check zone");

  it.todo("is_jup_a12_mercs_time should check day state");
});
