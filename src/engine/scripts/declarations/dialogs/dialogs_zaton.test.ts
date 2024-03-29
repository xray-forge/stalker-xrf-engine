import { beforeAll, describe, it } from "@jest/globals";

import { TName } from "@/engine/lib/types";
import { checkNestedBinding } from "@/fixtures/engine";

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs_zaton", name);
}

describe("dialogs_zaton external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialogs_zaton");
  });

  it("should correctly inject dialog functors", () => {
    checkDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell");
    checkDialogsBinding("zat_b30_owl_can_say_about_heli");
    checkDialogsBinding("zat_b30_actor_has_1000");
    checkDialogsBinding("zat_b30_actor_has_200");
    checkDialogsBinding("zat_b30_actor_has_pri_b36_monolith_hiding_place_pda");
    checkDialogsBinding("zat_b30_actor_has_pri_b306_envoy_pda");
    checkDialogsBinding("zat_b30_actor_has_jup_b10_strelok_notes_1");
    checkDialogsBinding("zat_b30_actor_has_jup_b10_strelok_notes_2");
    checkDialogsBinding("zat_b30_actor_has_jup_b10_strelok_notes_3");
    checkDialogsBinding("zat_b30_actor_has_detector_scientific");
    checkDialogsBinding("zat_b30_actor_has_device_flash_snag");
    checkDialogsBinding("zat_b30_actor_has_device_pda_port_bandit_leader");
    checkDialogsBinding("zat_b30_actor_has_jup_b10_ufo_memory");
    checkDialogsBinding("zat_b30_actor_has_jup_b202_bandit_pda");
    checkDialogsBinding("zat_b30_transfer_1000");
    checkDialogsBinding("zat_b30_transfer_200");
    checkDialogsBinding("zat_b30_sell_pri_b36_monolith_hiding_place_pda");
    checkDialogsBinding("zat_b30_sell_pri_b306_envoy_pda");
    checkDialogsBinding("zat_b30_sell_jup_b207_merc_pda_with_contract");
    checkDialogsBinding("zat_b30_sell_jup_b10_strelok_notes_1");
    checkDialogsBinding("zat_b30_sell_jup_b10_strelok_notes_2");
    checkDialogsBinding("zat_b30_sell_jup_b10_strelok_notes_3");
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info");
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info");
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info");
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info");
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_device_flash_snag");
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader");
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory");
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda");
    checkDialogsBinding("zat_b14_bar_transfer_money");
    checkDialogsBinding("zat_b14_transfer_artefact");
    checkDialogsBinding("actor_has_artefact");
    checkDialogsBinding("actor_hasnt_artefact");
    checkDialogsBinding("zat_b7_give_bandit_reward_to_actor");
    checkDialogsBinding("zat_b7_give_stalker_reward_to_actor");
    checkDialogsBinding("zat_b7_give_stalker_reward_2_to_actor");
    checkDialogsBinding("zat_b7_rob_actor");
    checkDialogsBinding("zat_b7_killed_self_precond");
    checkDialogsBinding("zat_b7_squad_alive");
    checkDialogsBinding("zat_b103_transfer_merc_supplies");
    checkDialogsBinding("zat_b33_set_counter_10");
    checkDialogsBinding("zat_b33_counter_ge_2");
    checkDialogsBinding("zat_b33_counter_ge_4");
    checkDialogsBinding("zat_b33_counter_ge_8");
    checkDialogsBinding("zat_b33_counter_le_2");
    checkDialogsBinding("zat_b33_counter_le_4");
    checkDialogsBinding("zat_b33_counter_le_8");
    checkDialogsBinding("zat_b33_counter_de_2");
    checkDialogsBinding("zat_b33_counter_de_4");
    checkDialogsBinding("zat_b33_counter_de_8");
    checkDialogsBinding("zat_b33_counter_eq_10");
    checkDialogsBinding("zat_b33_counter_ne_10");
    checkDialogsBinding("zat_b103_transfer_mechanic_toolkit_2");
    checkDialogsBinding("check_npc_name_mechanics");
    checkDialogsBinding("zat_b33_transfer_first_item");
    checkDialogsBinding("zat_b33_transfer_second_item");
    checkDialogsBinding("zat_b33_transfer_third_item");
    checkDialogsBinding("zat_b33_transfer_fourth_item");
    checkDialogsBinding("zat_b33_transfer_fifth_item");
    checkDialogsBinding("zat_b33_transfer_safe_container");
    checkDialogsBinding("zat_b33_aractor_has_habar");
    checkDialogsBinding("zat_b33_actor_hasnt_habar");
    checkDialogsBinding("zat_b33_actor_has_needed_money");
    checkDialogsBinding("zat_b33_actor_hasnt_needed_money");
    checkDialogsBinding("zat_b33_relocate_money");
    checkDialogsBinding("zat_b29_create_af_in_anomaly");
    checkDialogsBinding("zat_b29_linker_give_adv_task");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af");
    checkDialogsBinding("zat_b29_linker_get_adv_task_af");
    checkDialogsBinding("zat_b29_actor_has_exchange_item");
    checkDialogsBinding("zat_b29_actor_exchange");
    checkDialogsBinding("zat_b30_transfer_percent");
    checkDialogsBinding("zat_b30_npc_has_detector");
    checkDialogsBinding("zat_b30_actor_second_exchange");
    checkDialogsBinding("zat_b30_actor_exchange");
    checkDialogsBinding("zat_b30_actor_has_two_detectors");
    checkDialogsBinding("actor_has_nimble_weapon");
    checkDialogsBinding("zat_b51_robbery");
    checkDialogsBinding("zat_b51_rob_nimble_weapon");
    checkDialogsBinding("give_compass_to_actor");
    checkDialogsBinding("zat_b51_randomize_item");
    checkDialogsBinding("zat_b51_give_prepay");
    checkDialogsBinding("zat_b51_has_prepay");
    checkDialogsBinding("zat_b51_hasnt_prepay");
    checkDialogsBinding("zat_b51_buy_item");
    checkDialogsBinding("zat_b51_refuse_item");
    checkDialogsBinding("zat_b51_has_item_cost");
    checkDialogsBinding("zat_b51_hasnt_item_cost");
    checkDialogsBinding("zat_b12_actor_have_documents");
    checkDialogsBinding("zat_b12_actor_transfer_documents");
    checkDialogsBinding("zat_b3_actor_got_toolkit");
    checkDialogsBinding("give_toolkit_3");
    checkDialogsBinding("give_toolkit_1");
    checkDialogsBinding("if_actor_has_toolkit_1");
    checkDialogsBinding("give_toolkit_2");
    checkDialogsBinding("if_actor_has_toolkit_2");
    checkDialogsBinding("zat_b215_counter_greater_3");
    checkDialogsBinding("zat_b40_transfer_notebook");
    checkDialogsBinding("zat_b40_transfer_merc_pda_1");
    checkDialogsBinding("zat_b40_transfer_merc_pda_2");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_1");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_2");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_3");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_4");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_5");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_6");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_7");
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_8");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_1");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_2");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_3");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_4");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_5");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_6");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_7");
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_8");
    checkDialogsBinding("zat_b30_transfer_detector_to_actor");
    checkDialogsBinding("zat_b30_give_owls_share_to_actor");
    checkDialogsBinding("zat_b30_actor_has_compass");
    checkDialogsBinding("zat_b30_transfer_af_from_actor");
    checkDialogsBinding("zat_b30_barmen_has_percent");
    checkDialogsBinding("zat_b30_barmen_do_not_has_percent");
    checkDialogsBinding("zat_b30_actor_has_noah_pda");
    checkDialogsBinding("zat_b30_sell_noah_pda");
    checkDialogsBinding("zat_b40_actor_has_notebook");
    checkDialogsBinding("zat_b40_actor_has_merc_pda_1");
    checkDialogsBinding("zat_b40_actor_has_merc_pda_2");
    checkDialogsBinding("if_actor_has_toolkit_3");
    checkDialogsBinding("give_vodka");
    checkDialogsBinding("if_actor_has_vodka");
    checkDialogsBinding("actor_has_more_then_need_money_to_buy_battery");
    checkDialogsBinding("actor_has_less_then_need_money_to_buy_battery");
    checkDialogsBinding("relocate_need_money_to_buy_battery");
    checkDialogsBinding("give_actor_battery");
    checkDialogsBinding("give_actor_zat_a23_access_card");
    checkDialogsBinding("give_zat_a23_gauss_rifle_docs");
    checkDialogsBinding("return_zat_a23_gauss_rifle_docs");
    checkDialogsBinding("if_actor_has_zat_a23_gauss_rifle_docs");
    checkDialogsBinding("if_actor_has_gauss_rifle");
    checkDialogsBinding("give_tech_gauss_rifle");
    checkDialogsBinding("give_actor_repaired_gauss_rifle");
    checkDialogsBinding("zat_b215_actor_has_money_poor");
    checkDialogsBinding("zat_b215_actor_has_no_money_poor");
    checkDialogsBinding("zat_b215_actor_has_money_poor_pripyat");
    checkDialogsBinding("zat_b215_actor_has_no_money_poor_pripyat");
    checkDialogsBinding("zat_b215_actor_has_money_rich");
    checkDialogsBinding("zat_b215_actor_has_no_money_rich");
    checkDialogsBinding("zat_b215_actor_has_money_rich_pripyat");
    checkDialogsBinding("zat_b215_actor_has_no_money_rich_pripyat");
    checkDialogsBinding("zat_b215_relocate_money_poor");
    checkDialogsBinding("zat_b215_relocate_money_poor_pripyat");
    checkDialogsBinding("zat_b215_relocate_money_rich");
    checkDialogsBinding("zat_b215_relocate_money_rich_pripyat");
    checkDialogsBinding("zat_b44_actor_has_pda_global");
    checkDialogsBinding("zat_b44_actor_has_not_pda_global");
    checkDialogsBinding("zat_b44_actor_has_pda_barge");
    checkDialogsBinding("zat_b44_actor_has_pda_joker");
    checkDialogsBinding("zat_b44_actor_has_pda_both");
    checkDialogsBinding("zat_b44_transfer_pda_barge");
    checkDialogsBinding("zat_b44_transfer_pda_joker");
    checkDialogsBinding("zat_b44_transfer_pda_both");
    checkDialogsBinding("zat_b44_frends_dialog_enabled");
    checkDialogsBinding("zat_b53_if_actor_has_detector_advanced");
    checkDialogsBinding("zat_b53_transfer_medkit_to_npc");
    checkDialogsBinding("is_zat_b106_hunting_time");
    checkDialogsBinding("is_not_zat_b106_hunting_time");
    checkDialogsBinding("zat_b53_if_actor_hasnt_detector_advanced");
    checkDialogsBinding("zat_b53_transfer_detector_advanced_to_actor");
    checkDialogsBinding("zat_b53_transfer_fireball_to_actor");
    checkDialogsBinding("zat_b53_transfer_medkit_to_actor");
    checkDialogsBinding("zat_b106_soroka_reward");
    checkDialogsBinding("zat_b103_actor_has_needed_food");
    checkDialogsBinding("zat_b106_transfer_weap_to_actor");
    checkDialogsBinding("zat_b106_give_reward");
    checkDialogsBinding("zat_b3_tech_drinks_precond");
    checkDialogsBinding("zat_b106_soroka_gone");
    checkDialogsBinding("zat_b106_soroka_not_gone");
    checkDialogsBinding("zat_b22_actor_has_proof");
    checkDialogsBinding("zat_b22_transfer_proof");
    checkDialogsBinding("zat_b5_stalker_transfer_money");
    checkDialogsBinding("zat_b5_dealer_full_revard");
    checkDialogsBinding("zat_b5_dealer_easy_revard");
    checkDialogsBinding("zat_b5_bandits_revard");
    checkDialogsBinding("zat_a23_actor_has_access_card");
    checkDialogsBinding("zat_a23_transfer_access_card_to_tech");
    checkDialogsBinding("zat_b57_stalker_reward_to_actor_detector");
    checkDialogsBinding("actor_has_gas");
    checkDialogsBinding("actor_has_not_gas");
    checkDialogsBinding("zat_b57_actor_has_money");
    checkDialogsBinding("zat_b57_actor_hasnt_money");
    checkDialogsBinding("zat_b57_transfer_gas_money");
  });
});
