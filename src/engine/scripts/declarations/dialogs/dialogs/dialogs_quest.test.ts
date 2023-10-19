import { beforeAll, describe, it } from "@jest/globals";

import { TName } from "@/engine/lib/types";
import { checkNestedBinding } from "@/fixtures/engine";

describe("dialogs_quest external callbacks", () => {
  const checkDialogsBinding = (name: TName) => checkNestedBinding("dialogs", name);

  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_quest");
  });

  it("should correctly inject dialog functors", () => {
    checkDialogsBinding("quest_dialog_heli_precond");
    checkDialogsBinding("quest_dialog_military_precond");
    checkDialogsBinding("quest_dialog_squad_precond");
    checkDialogsBinding("quest_dialog_toolkits_precond");
    checkDialogsBinding("monolith_leader_is_alive");
    checkDialogsBinding("monolith_leader_dead_or_hired");
    checkDialogsBinding("monolith_leader_dead_or_dolg");
    checkDialogsBinding("squad_not_in_smart_b101");
    checkDialogsBinding("squad_not_in_smart_b103");
    checkDialogsBinding("squad_not_in_smart_b104");
    checkDialogsBinding("squad_not_in_smart_b213");
    checkDialogsBinding("squad_not_in_smart_b214");
    checkDialogsBinding("squad_not_in_smart_b304");
    checkDialogsBinding("squad_not_in_smart_b303");
    checkDialogsBinding("squad_not_in_smart_b40");
    checkDialogsBinding("squad_not_in_smart_b18");
    checkDialogsBinding("squad_not_in_smart_b6");
    checkDialogsBinding("squad_not_in_smart_b205");
    checkDialogsBinding("squad_not_in_smart_b47");
    checkDialogsBinding("squad_in_smart_zat_base");
    checkDialogsBinding("squad_in_smart_jup_b25");
    checkDialogsBinding("spartak_is_alive");
    checkDialogsBinding("tesak_is_alive");
    checkDialogsBinding("gonta_is_alive");
    checkDialogsBinding("mityay_is_alive");
    checkDialogsBinding("dolg_can_work_for_sci");
    checkDialogsBinding("dolg_can_not_work_for_sci");
    checkDialogsBinding("freedom_can_work_for_sci");
    checkDialogsBinding("freedom_can_not_work_for_sci");
    checkDialogsBinding("monolith_leader_dead_or_freedom");
    checkDialogsBinding("medic_magic_potion");
    checkDialogsBinding("actor_needs_bless");
    checkDialogsBinding("actor_is_damn_healthy");
    checkDialogsBinding("leave_zone_save");
    checkDialogsBinding("save_uni_travel_zat_to_jup");
    checkDialogsBinding("save_uni_travel_zat_to_pri");
    checkDialogsBinding("save_uni_travel_jup_to_zat");
    checkDialogsBinding("save_uni_travel_jup_to_pri");
    checkDialogsBinding("save_uni_travel_pri_to_zat");
    checkDialogsBinding("save_uni_travel_pri_to_jup");
    checkDialogsBinding("save_jup_b218_travel_jup_to_pas");
    checkDialogsBinding("save_pri_a17_hospital_start");
    checkDialogsBinding("save_jup_a10_gonna_return_debt");
    checkDialogsBinding("save_jup_b6_arrived_to_fen");
    checkDialogsBinding("save_jup_b6_arrived_to_ash_heap");
    checkDialogsBinding("save_jup_b19_arrived_to_kopachy");
    checkDialogsBinding("save_zat_b106_arrived_to_chimera_lair");
    checkDialogsBinding("save_zat_b5_met_with_others");
  });
});
