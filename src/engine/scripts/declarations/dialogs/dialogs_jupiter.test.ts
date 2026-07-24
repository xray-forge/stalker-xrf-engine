import { beforeAll, describe, it } from "@jest/globals";
import { TName } from "xray16/lib";

import { checkNestedBinding } from "@/fixtures/engine";

function checkBinding(name: TName): void {
  return checkNestedBinding("dialogs_jupiter", name);
}

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs_jupiter");
});

describe("jup_b208_give_reward", () => {
  it("should be registered", () => {
    checkBinding("jup_b208_give_reward");
  });
});

describe("jupiter_a9_actor_hasnt_all_mail_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_actor_hasnt_all_mail_items");
  });
});

describe("jupiter_a9_actor_has_all_mail_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_actor_has_all_mail_items");
  });
});

describe("jupiter_a9_actor_has_any_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_actor_has_any_items");
  });
});

describe("jupiter_a9_actor_has_any_mail_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_actor_has_any_mail_items");
  });
});

describe("jupiter_a9_actor_has_any_secondary_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_actor_has_any_secondary_items");
  });
});

describe("jupiter_a9_actor_hasnt_any_mail_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_actor_hasnt_any_mail_items");
  });
});

describe("jupiter_a9_freedom_leader_jupiter_delivery", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_freedom_leader_jupiter_delivery");
  });
});

describe("jupiter_a9_freedom_leader_jupiter_evacuation", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_freedom_leader_jupiter_evacuation");
  });
});

describe("jupiter_a9_freedom_leader_jupiter_losses", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_freedom_leader_jupiter_losses");
  });
});

describe("jupiter_a9_freedom_leader_jupiter_meeting", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_freedom_leader_jupiter_meeting");
  });
});

describe("jupiter_a9_dolg_leader_jupiter_delivery", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_dolg_leader_jupiter_delivery");
  });
});

describe("jupiter_a9_dolg_leader_jupiter_evacuation", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_dolg_leader_jupiter_evacuation");
  });
});

describe("jupiter_a9_dolg_leader_jupiter_losses", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_dolg_leader_jupiter_losses");
  });
});

describe("jupiter_a9_dolg_leader_jupiter_meeting", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_dolg_leader_jupiter_meeting");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info");
  });
});

describe("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items");
  });
});

describe("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items");
  });
});

describe("jup_a9_actor_has_conservation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_conservation_info");
  });
});

describe("jup_a9_actor_hasnt_conservation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_conservation_info");
  });
});

describe("actor_relocate_conservation_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_conservation_info");
  });
});

describe("jup_a9_actor_has_power_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_power_info");
  });
});

describe("jup_a9_actor_hasnt_power_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_power_info");
  });
});

describe("actor_relocate_power_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_power_info");
  });
});

describe("jup_a9_actor_has_way_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_way_info");
  });
});

describe("jup_a9_actor_hasnt_way_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_way_info");
  });
});

describe("actor_relocate_way_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_way_info");
  });
});

describe("jup_a9_actor_has_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_meeting_info");
  });
});

describe("jup_a9_actor_hasnt_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_meeting_info");
  });
});

describe("actor_relocate_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_meeting_info");
  });
});

describe("jup_a9_actor_has_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_delivery_info");
  });
});

describe("jup_a9_actor_hasnt_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_delivery_info");
  });
});

describe("jup_a9_actor_has_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_evacuation_info");
  });
});

describe("jup_a9_actor_hasnt_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_evacuation_info");
  });
});

describe("actor_relocate_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_evacuation_info");
  });
});

describe("actor_relocate_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_delivery_info");
  });
});

describe("jup_a9_actor_has_losses_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_losses_info");
  });
});

describe("jup_a9_actor_hasnt_losses_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_losses_info");
  });
});

describe("actor_relocate_losses_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_losses_info");
  });
});

describe("actor_has_plant", () => {
  it("should be registered", () => {
    checkBinding("actor_has_plant");
  });
});

describe("actor_relocate_plant", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_plant");
  });
});

describe("actor_relocate_trapper_reward", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_trapper_reward");
  });
});

describe("zat_b106_trapper_reward", () => {
  it("should be registered", () => {
    checkBinding("zat_b106_trapper_reward");
  });
});

describe("jup_a10_proverka_wpn", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_proverka_wpn");
  });
});

describe("jup_a10_proverka_wpn_false", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_proverka_wpn_false");
  });
});

describe("jup_a10_actor_has_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_money");
  });
});

describe("jup_a10_actor_has_not_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_not_money");
  });
});

describe("jup_a10_actor_give_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_give_money");
  });
});

describe("jup_a10_vano_give_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_vano_give_money");
  });
});

describe("jup_a10_actor_give_outfit_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_give_outfit_money");
  });
});

describe("jup_a10_actor_has_outfit_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_outfit_money");
  });
});

describe("jup_a10_actor_has_not_outfit_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_not_outfit_money");
  });
});

describe("if_actor_has_jup_b16_oasis_artifact", () => {
  it("should be registered", () => {
    checkBinding("if_actor_has_jup_b16_oasis_artifact");
  });
});

describe("if_actor_hasnt_jup_b16_oasis_artifact", () => {
  it("should be registered", () => {
    checkBinding("if_actor_hasnt_jup_b16_oasis_artifact");
  });
});

describe("jupiter_b16_reward", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b16_reward");
  });
});

describe("give_jup_b16_oasis_artifact", () => {
  it("should be registered", () => {
    checkBinding("give_jup_b16_oasis_artifact");
  });
});

describe("jup_a12_actor_has_15000_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_15000_money");
  });
});

describe("jup_a12_actor_do_not_has_15000_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_do_not_has_15000_money");
  });
});

describe("jup_a12_actor_has_artefacts", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefacts");
  });
});

describe("jup_a12_actor_has_artefact_1", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_1");
  });
});

describe("jup_a12_actor_has_artefact_2", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_2");
  });
});

describe("jup_a12_actor_has_artefact_3", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_3");
  });
});

describe("jup_a12_actor_has_artefact_4", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_4");
  });
});

describe("jup_a12_actor_do_not_has_artefacts", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_do_not_has_artefacts");
  });
});

describe("jup_a12_transfer_ransom_from_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_ransom_from_actor");
  });
});

describe("jup_a12_transfer_5000_money_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_5000_money_to_actor");
  });
});

describe("jup_a12_transfer_artefact_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_artefact_to_actor");
  });
});

describe("jup_a12_transfer_cashier_money_from_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_cashier_money_from_actor");
  });
});

describe("zat_b30_transfer_detectors", () => {
  it("should be registered", () => {
    checkBinding("zat_b30_transfer_detectors");
  });
});

describe("zat_b30_actor_do_not_has_transfer_items", () => {
  it("should be registered", () => {
    checkBinding("zat_b30_actor_do_not_has_transfer_items");
  });
});

describe("zat_b30_actor_has_transfer_items", () => {
  it("should be registered", () => {
    checkBinding("zat_b30_actor_has_transfer_items");
  });
});

describe("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond");
  });
});

describe("jup_b32_task_give_dialog_precond", () => {
  it("should be registered", () => {
    checkBinding("jup_b32_task_give_dialog_precond");
  });
});

describe("jup_b32_transfer_scanners", () => {
  it("should be registered", () => {
    checkBinding("jup_b32_transfer_scanners");
  });
});

describe("jup_b32_transfer_scanners_2", () => {
  it("should be registered", () => {
    checkBinding("jup_b32_transfer_scanners_2");
  });
});

describe("jup_b32_give_reward_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b32_give_reward_to_actor");
  });
});

describe("jup_b209_get_monster_scanner", () => {
  it("should be registered", () => {
    checkBinding("jup_b209_get_monster_scanner");
  });
});

describe("jup_b209_return_monster_scanner", () => {
  it("should be registered", () => {
    checkBinding("jup_b209_return_monster_scanner");
  });
});

describe("jup_b32_anomaly_do_not_has_af", () => {
  it("should be registered", () => {
    checkBinding("jup_b32_anomaly_do_not_has_af");
  });
});

describe("jup_b207_generic_decrypt_need_dialog_precond", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_generic_decrypt_need_dialog_precond");
  });
});

describe("jup_b207_actor_has_dealers_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_actor_has_dealers_pda");
  });
});

describe("jup_b207_sell_dealers_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_sell_dealers_pda");
  });
});

describe("jup_b207_give_dealers_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_give_dealers_pda");
  });
});

describe("jup_b207_actor_has_merc_pda_with_contract", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_actor_has_merc_pda_with_contract");
  });
});

describe("jup_b207_sell_merc_pda_with_contract", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_sell_merc_pda_with_contract");
  });
});

describe("jup_b207_transfer_blackmail_reward", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_transfer_blackmail_reward");
  });
});

describe("jup_b207_transfer_blackmail_reward_for_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b207_transfer_blackmail_reward_for_pda");
  });
});

describe("give_jup_b1_art", () => {
  it("should be registered", () => {
    checkBinding("give_jup_b1_art");
  });
});

describe("if_actor_has_jup_b1_art", () => {
  it("should be registered", () => {
    checkBinding("if_actor_has_jup_b1_art");
  });
});

describe("jup_b1_actor_do_not_have_good_suit", () => {
  it("should be registered", () => {
    checkBinding("jup_b1_actor_do_not_have_good_suit");
  });
});

describe("jup_b1_reward_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b1_reward_actor");
  });
});

describe("jup_b6_actor_outfit_cs", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_actor_outfit_cs");
  });
});

describe("jup_b6_first_reward_for_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_first_reward_for_actor");
  });
});

describe("jup_b6_second_reward_for_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_second_reward_for_actor");
  });
});

describe("jup_b6_all_reward_for_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_all_reward_for_actor");
  });
});

describe("jup_b6_first_reward_for_actor_extra", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_first_reward_for_actor_extra");
  });
});

describe("jup_b6_second_reward_for_actor_extra", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_second_reward_for_actor_extra");
  });
});

describe("jup_b6_all_reward_for_actor_extra", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_all_reward_for_actor_extra");
  });
});

describe("jup_b6_reward_actor_by_detector", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_reward_actor_by_detector");
  });
});

describe("jup_b1_actor_have_good_suit", () => {
  it("should be registered", () => {
    checkBinding("jup_b1_actor_have_good_suit");
  });
});

describe("jup_b6_actor_can_not_start", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_actor_can_not_start");
  });
});

describe("jup_b6_actor_can_start", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_actor_can_start");
  });
});

describe("jup_b1_stalker_squad_thanks", () => {
  it("should be registered", () => {
    checkBinding("jup_b1_stalker_squad_thanks");
  });
});

describe("jup_b202_actor_has_medkit", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_actor_has_medkit");
  });
});

describe("jup_b202_hit_bandit_from_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_hit_bandit_from_actor");
  });
});

describe("jup_b202_medic_dialog_precondition", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_medic_dialog_precondition");
  });
});

describe("jup_b6_stalker_dialog_precond", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_stalker_dialog_precond");
  });
});

describe("jup_b217_actor_got_toolkit", () => {
  it("should be registered", () => {
    checkBinding("jup_b217_actor_got_toolkit");
  });
});

describe("jupiter_b200_tech_materials_relocate", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b200_tech_materials_relocate");
  });
});

describe("npc_in_b4_smart", () => {
  it("should be registered", () => {
    checkBinding("npc_in_b4_smart");
  });
});

describe("jup_b202_transfer_medkit", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_transfer_medkit");
  });
});

describe("jupiter_b220_all_hunted", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b220_all_hunted");
  });
});

describe("jupiter_b220_no_one_hunted", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b220_no_one_hunted");
  });
});

describe("jup_b9_actor_has_money", () => {
  it("should be registered", () => {
    checkBinding("jup_b9_actor_has_money");
  });
});

describe("jupiter_b9_relocate_money", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b9_relocate_money");
  });
});

describe("give_jup_b9_blackbox", () => {
  it("should be registered", () => {
    checkBinding("give_jup_b9_blackbox");
  });
});

describe("jup_b9_actor_has_not_money", () => {
  it("should be registered", () => {
    checkBinding("jup_b9_actor_has_not_money");
  });
});

describe("if_actor_has_jup_b9_blackbox", () => {
  it("should be registered", () => {
    checkBinding("if_actor_has_jup_b9_blackbox");
  });
});

describe("if_actor_has_af_mincer_meat", () => {
  it("should be registered", () => {
    checkBinding("if_actor_has_af_mincer_meat");
  });
});

describe("if_actor_has_af_fuzz_kolobok", () => {
  it("should be registered", () => {
    checkBinding("if_actor_has_af_fuzz_kolobok");
  });
});

describe("actor_has_first_or_second_artefact", () => {
  it("should be registered", () => {
    checkBinding("actor_has_first_or_second_artefact");
  });
});

describe("transfer_af_mincer_meat", () => {
  it("should be registered", () => {
    checkBinding("transfer_af_mincer_meat");
  });
});

describe("jup_b15_dec_counter", () => {
  it("should be registered", () => {
    checkBinding("jup_b15_dec_counter");
  });
});

describe("jup_b46_sell_duty_founder_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b46_sell_duty_founder_pda");
  });
});

describe("jup_b46_transfer_duty_founder_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b46_transfer_duty_founder_pda");
  });
});

describe("jup_b46_sell_duty_founder_pda_to_owl", () => {
  it("should be registered", () => {
    checkBinding("jup_b46_sell_duty_founder_pda_to_owl");
  });
});

describe("jup_b46_actor_has_founder_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b46_actor_has_founder_pda");
  });
});

describe("jup_b47_jupiter_docs_enabled", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_jupiter_docs_enabled");
  });
});

describe("transfer_af_fuzz_kolobok", () => {
  it("should be registered", () => {
    checkBinding("transfer_af_fuzz_kolobok");
  });
});

describe("pay_cost_to_guide_to_pripyat", () => {
  it("should be registered", () => {
    checkBinding("pay_cost_to_guide_to_pripyat");
  });
});

describe("jup_b43_actor_has_5000_money", () => {
  it("should be registered", () => {
    checkBinding("jup_b43_actor_has_5000_money");
  });
});

describe("jup_b43_actor_do_not_has_5000_money", () => {
  it("should be registered", () => {
    checkBinding("jup_b43_actor_do_not_has_5000_money");
  });
});

describe("jup_b43_reward_for_first_artefact", () => {
  it("should be registered", () => {
    checkBinding("jup_b43_reward_for_first_artefact");
  });
});

describe("jup_b43_reward_for_second_artefact", () => {
  it("should be registered", () => {
    checkBinding("jup_b43_reward_for_second_artefact");
  });
});

describe("jup_b43_reward_for_both_artefacts", () => {
  it("should be registered", () => {
    checkBinding("jup_b43_reward_for_both_artefacts");
  });
});

describe("jup_b218_counter_not_3", () => {
  it("should be registered", () => {
    checkBinding("jup_b218_counter_not_3");
  });
});

describe("jup_b218_counter_equal_3", () => {
  it("should be registered", () => {
    checkBinding("jup_b218_counter_equal_3");
  });
});

describe("jup_b218_counter_not_0", () => {
  it("should be registered", () => {
    checkBinding("jup_b218_counter_not_0");
  });
});

describe("jup_b25_frase_count_inc", () => {
  it("should be registered", () => {
    checkBinding("jup_b25_frase_count_inc");
  });
});

describe("jup_b32_anomaly_has_af", () => {
  it("should be registered", () => {
    checkBinding("jup_b32_anomaly_has_af");
  });
});

describe("jup_b4_is_actor_not_enemies_to_freedom", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_not_enemies_to_freedom");
  });
});

describe("jup_b4_is_actor_enemies_to_freedom", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_enemies_to_freedom");
  });
});

describe("jup_b4_is_actor_friend_to_freedom", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_friend_to_freedom");
  });
});

describe("jup_b4_is_actor_neutral_to_freedom", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_neutral_to_freedom");
  });
});

describe("jup_b4_is_actor_not_enemies_to_dolg", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_not_enemies_to_dolg");
  });
});

describe("jup_b4_is_actor_enemies_to_dolg", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_enemies_to_dolg");
  });
});

describe("jup_b4_is_actor_friend_to_dolg", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_friend_to_dolg");
  });
});

describe("jup_b4_is_actor_neutral_to_dolg", () => {
  it("should be registered", () => {
    checkBinding("jup_b4_is_actor_neutral_to_dolg");
  });
});

describe("jup_b47_jupiter_products_info_enabled", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_jupiter_products_info_enabled");
  });
});

describe("jup_b47_jupiter_products_info_disabled", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_jupiter_products_info_disabled");
  });
});

describe("jup_b47_jupiter_products_info_revard", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_jupiter_products_info_revard");
  });
});

describe("jup_b47_actor_has_merc_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_actor_has_merc_pda");
  });
});

describe("jup_b47_actor_has_not_merc_pda", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_actor_has_not_merc_pda");
  });
});

describe("jup_b47_merc_pda_revard", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_merc_pda_revard");
  });
});

describe("jup_b47_actor_can_take_task", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_actor_can_take_task");
  });
});

describe("jup_b47_employ_squad", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_employ_squad");
  });
});

describe("jup_b47_bunker_guard_revard", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_bunker_guard_revard");
  });
});

describe("jup_b47_gauss_rifle_revard", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_gauss_rifle_revard");
  });
});

describe("jup_b47_actor_has_hauss_rifle_docs", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_actor_has_hauss_rifle_docs");
  });
});

describe("jup_b10_ufo_memory_give_to_npc", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_memory_give_to_npc");
  });
});

describe("jup_b10_ufo_memory_give_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_memory_give_to_actor");
  });
});

describe("jup_b10_ufo_memory_2_give_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_memory_2_give_to_actor");
  });
});

describe("jup_b10_ufo_has_money_1000", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_has_money_1000");
  });
});

describe("jup_b10_ufo_has_money_3000", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_has_money_3000");
  });
});

describe("jup_b10_ufo_hasnt_money_1000", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_hasnt_money_1000");
  });
});

describe("jup_b10_ufo_hasnt_money_3000", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_hasnt_money_3000");
  });
});

describe("jup_b10_ufo_relocate_money_1000", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_relocate_money_1000");
  });
});

describe("jup_b10_ufo_relocate_money_3000", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_ufo_relocate_money_3000");
  });
});

describe("jup_b10_actor_has_ufo_memory", () => {
  it("should be registered", () => {
    checkBinding("jup_b10_actor_has_ufo_memory");
  });
});

describe("jup_b211_kill_bludsuckers_reward", () => {
  it("should be registered", () => {
    checkBinding("jup_b211_kill_bludsuckers_reward");
  });
});

describe("jup_b19_transfer_conserva_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b19_transfer_conserva_to_actor");
  });
});

describe("jupiter_b6_sell_halfartefact", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b6_sell_halfartefact");
  });
});

describe("pri_a15_sokolov_actor_has_note", () => {
  it("should be registered", () => {
    checkBinding("pri_a15_sokolov_actor_has_note");
  });
});

describe("pri_a15_sokolov_actor_has_not_note", () => {
  it("should be registered", () => {
    checkBinding("pri_a15_sokolov_actor_has_not_note");
  });
});

describe("pri_a15_sokolov_actor_give_note", () => {
  it("should be registered", () => {
    checkBinding("pri_a15_sokolov_actor_give_note");
  });
});

describe("jup_b47_actor_not_enemy_to_freedom", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_actor_not_enemy_to_freedom");
  });
});

describe("jup_b47_actor_not_enemy_to_dolg", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_actor_not_enemy_to_dolg");
  });
});

describe("jup_b15_actor_sci_outfit", () => {
  it("should be registered", () => {
    checkBinding("jup_b15_actor_sci_outfit");
  });
});

describe("jup_b15_no_actor_sci_outfit", () => {
  it("should be registered", () => {
    checkBinding("jup_b15_no_actor_sci_outfit");
  });
});

describe("jup_b19_reward", () => {
  it("should be registered", () => {
    checkBinding("jup_b19_reward");
  });
});
