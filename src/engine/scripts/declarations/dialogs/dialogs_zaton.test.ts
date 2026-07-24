import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveMoneyToActor, transferItemsFromActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
import { callBinding, checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs_zaton", name);
}

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs_zaton");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("zat_b30_owl_stalker_trader_actor_has_item_to_sell", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell");
  });
});

describe("zat_b30_owl_can_say_about_heli", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_owl_can_say_about_heli");
  });
});

describe("zat_b30_actor_has_1000", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_1000");
  });
});

describe("zat_b30_actor_has_200", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_200");
  });
});

describe("zat_b30_actor_has_pri_b36_monolith_hiding_place_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_pri_b36_monolith_hiding_place_pda");
  });
});

describe("zat_b30_actor_has_pri_b306_envoy_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_pri_b306_envoy_pda");
  });
});

describe("zat_b30_actor_has_jup_b10_strelok_notes_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_jup_b10_strelok_notes_1");
  });
});

describe("zat_b30_actor_has_jup_b10_strelok_notes_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_jup_b10_strelok_notes_2");
  });
});

describe("zat_b30_actor_has_jup_b10_strelok_notes_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_jup_b10_strelok_notes_3");
  });
});

describe("zat_b30_actor_has_detector_scientific", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_detector_scientific");
  });
});

describe("zat_b30_actor_has_device_flash_snag", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_device_flash_snag");
  });
});

describe("zat_b30_actor_has_device_pda_port_bandit_leader", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_device_pda_port_bandit_leader");
  });
});

describe("zat_b30_actor_has_jup_b10_ufo_memory", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_jup_b10_ufo_memory");
  });
});

describe("zat_b30_actor_has_jup_b202_bandit_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_jup_b202_bandit_pda");
  });
});

describe("zat_b30_transfer_1000", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_transfer_1000");
  });
});

describe("zat_b30_transfer_200", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_transfer_200");
  });
});

describe("zat_b30_sell_pri_b36_monolith_hiding_place_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_pri_b36_monolith_hiding_place_pda");
  });
});

describe("zat_b30_sell_pri_b306_envoy_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_pri_b306_envoy_pda");
  });
});

describe("zat_b30_sell_jup_b207_merc_pda_with_contract", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_jup_b207_merc_pda_with_contract");
  });
});

describe("zat_b30_sell_jup_b10_strelok_notes_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_jup_b10_strelok_notes_1");
  });
});

describe("zat_b30_sell_jup_b10_strelok_notes_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_jup_b10_strelok_notes_2");
  });
});

describe("zat_b30_sell_jup_b10_strelok_notes_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_jup_b10_strelok_notes_3");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info");
  });
});

describe("zat_b30_owl_stalker_trader_sell_device_flash_snag", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_device_flash_snag");
  });
});

describe("zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader");
  });
});

describe("zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory");
  });
});

describe("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda");
  });
});

describe("zat_b14_bar_transfer_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b14_bar_transfer_money");
  });
});

describe("zat_b14_transfer_artefact", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b14_transfer_artefact");
  });
});

describe("actor_has_artefact", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_artefact");
  });
});

describe("actor_hasnt_artefact", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_hasnt_artefact");
  });
});

describe("zat_b7_give_bandit_reward_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b7_give_bandit_reward_to_actor");
  });
});

describe("zat_b7_give_stalker_reward_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b7_give_stalker_reward_to_actor");
  });
});

describe("zat_b7_give_stalker_reward_2_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b7_give_stalker_reward_2_to_actor");
  });
});

describe("zat_b7_rob_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b7_rob_actor");
  });
});

describe("zat_b7_killed_self_precond", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b7_killed_self_precond");
  });
});

describe("zat_b7_squad_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b7_squad_alive");
  });
});

describe("zat_b103_transfer_merc_supplies", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b103_transfer_merc_supplies");
  });
});

describe("zat_b33_set_counter_10", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_set_counter_10");
  });
});

describe("zat_b33_counter_ge_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_ge_2");
  });
});

describe("zat_b33_counter_ge_4", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_ge_4");
  });
});

describe("zat_b33_counter_ge_8", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_ge_8");
  });
});

describe("zat_b33_counter_le_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_le_2");
  });
});

describe("zat_b33_counter_le_4", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_le_4");
  });
});

describe("zat_b33_counter_le_8", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_le_8");
  });
});

describe("zat_b33_counter_de_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_de_2");
  });
});

describe("zat_b33_counter_de_4", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_de_4");
  });
});

describe("zat_b33_counter_de_8", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_de_8");
  });
});

describe("zat_b33_counter_eq_10", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_eq_10");
  });
});

describe("zat_b33_counter_ne_10", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_counter_ne_10");
  });
});

describe("zat_b103_transfer_mechanic_toolkit_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b103_transfer_mechanic_toolkit_2");
  });
});

describe("check_npc_name_mechanics", () => {
  it("should be registered", () => {
    checkDialogsBinding("check_npc_name_mechanics");
  });
});

describe("zat_b33_transfer_first_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_transfer_first_item");
  });
});

describe("zat_b33_transfer_second_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_transfer_second_item");
  });
});

describe("zat_b33_transfer_third_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_transfer_third_item");
  });
});

describe("zat_b33_transfer_fourth_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_transfer_fourth_item");
  });
});

describe("zat_b33_transfer_fifth_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_transfer_fifth_item");
  });
});

describe("zat_b33_transfer_safe_container", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_transfer_safe_container");
  });
});

describe("zat_b33_aractor_has_habar", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_aractor_has_habar");
  });
});

describe("zat_b33_actor_hasnt_habar", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_actor_hasnt_habar");
  });
});

describe("zat_b33_actor_has_needed_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_actor_has_needed_money");
  });
});

describe("zat_b33_actor_hasnt_needed_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_actor_hasnt_needed_money");
  });
});

describe("zat_b33_relocate_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b33_relocate_money");
  });
});

describe("zat_b29_create_af_in_anomaly", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_create_af_in_anomaly");
  });
});

describe("zat_b29_linker_give_adv_task", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_linker_give_adv_task");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af");
  });
});

describe("zat_b29_actor_has_adv_task_af", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af");
  });
});

describe("zat_b29_linker_get_adv_task_af", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_linker_get_adv_task_af");
  });
});

describe("zat_b29_actor_has_exchange_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_exchange_item");
  });
});

describe("zat_b29_actor_exchange", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_exchange");
  });
});

describe("zat_b30_transfer_percent", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_transfer_percent");
  });
});

describe("zat_b30_npc_has_detector", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_npc_has_detector");
  });
});

describe("zat_b30_actor_second_exchange", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_second_exchange");
  });
});

describe("zat_b30_actor_exchange", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_exchange");
  });
});

describe("zat_b30_actor_has_two_detectors", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_two_detectors");
  });
});

describe("actor_has_nimble_weapon", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_nimble_weapon");
  });
});

describe("zat_b51_robbery", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_robbery");
  });
});

describe("zat_b51_rob_nimble_weapon", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_rob_nimble_weapon");
  });
});

describe("give_compass_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_compass_to_actor");
  });
});

describe("zat_b51_randomize_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_randomize_item");
  });
});

describe("zat_b51_give_prepay", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_give_prepay");
  });
});

describe("zat_b51_has_prepay", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_has_prepay");
  });
});

describe("zat_b51_hasnt_prepay", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_hasnt_prepay");
  });
});

describe("zat_b51_buy_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_buy_item");
  });
});

describe("zat_b51_refuse_item", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_refuse_item");
  });
});

describe("zat_b51_has_item_cost", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_has_item_cost");
  });
});

describe("zat_b51_hasnt_item_cost", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b51_hasnt_item_cost");
  });
});

describe("zat_b12_actor_have_documents", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b12_actor_have_documents");
  });
});

describe("zat_b12_actor_transfer_documents", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b12_actor_transfer_documents");
  });
});

describe("zat_b3_actor_got_toolkit", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b3_actor_got_toolkit");
  });
});

describe("give_toolkit_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_toolkit_3");
  });
});

describe("give_toolkit_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_toolkit_1");
  });
});

describe("if_actor_has_toolkit_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("if_actor_has_toolkit_1");
  });
});

describe("give_toolkit_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_toolkit_2");
  });
});

describe("if_actor_has_toolkit_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("if_actor_has_toolkit_2");
  });
});

describe("zat_b215_counter_greater_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_counter_greater_3");
  });
});

describe("zat_b40_transfer_notebook", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b40_transfer_notebook");
  });
});

describe("zat_b40_transfer_merc_pda_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b40_transfer_merc_pda_1");
  });
});

describe("zat_b40_transfer_merc_pda_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b40_transfer_merc_pda_2");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_1");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_2");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_3");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_4", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_4");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_5", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_5");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_6", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_6");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_7", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_7");
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af_8", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_do_not_has_adv_task_af_8");
  });
});

describe("zat_b29_actor_has_adv_task_af_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_1");
  });
});

describe("zat_b29_actor_has_adv_task_af_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_2");
  });
});

describe("zat_b29_actor_has_adv_task_af_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_3");
  });
});

describe("zat_b29_actor_has_adv_task_af_4", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_4");
  });
});

describe("zat_b29_actor_has_adv_task_af_5", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_5");
  });
});

describe("zat_b29_actor_has_adv_task_af_6", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_6");
  });
});

describe("zat_b29_actor_has_adv_task_af_7", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_7");
  });
});

describe("zat_b29_actor_has_adv_task_af_8", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b29_actor_has_adv_task_af_8");
  });
});

describe("zat_b30_transfer_detector_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_transfer_detector_to_actor");
  });
});

describe("zat_b30_give_owls_share_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_give_owls_share_to_actor");
  });
});

describe("zat_b30_actor_has_compass", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_compass");
  });
});

describe("zat_b30_transfer_af_from_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_transfer_af_from_actor");
  });
});

describe("zat_b30_barmen_has_percent", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_barmen_has_percent");
  });
});

describe("zat_b30_barmen_do_not_has_percent", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_barmen_do_not_has_percent");
  });
});

describe("zat_b30_actor_has_noah_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_actor_has_noah_pda");
  });
});

describe("zat_b30_sell_noah_pda", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b30_sell_noah_pda");
  });
});

describe("zat_b40_actor_has_notebook", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b40_actor_has_notebook");
  });
});

describe("zat_b40_actor_has_merc_pda_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b40_actor_has_merc_pda_1");
  });
});

describe("zat_b40_actor_has_merc_pda_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b40_actor_has_merc_pda_2");
  });
});

describe("if_actor_has_toolkit_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("if_actor_has_toolkit_3");
  });
});

describe("give_vodka", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_vodka");
  });
});

describe("if_actor_has_vodka", () => {
  it("should be registered", () => {
    checkDialogsBinding("if_actor_has_vodka");
  });
});

describe("actor_has_more_then_need_money_to_buy_battery", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_more_then_need_money_to_buy_battery");
  });
});

describe("actor_has_less_then_need_money_to_buy_battery", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_less_then_need_money_to_buy_battery");
  });
});

describe("relocate_need_money_to_buy_battery", () => {
  it("should be registered", () => {
    checkDialogsBinding("relocate_need_money_to_buy_battery");
  });
});

describe("give_actor_battery", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_actor_battery");
  });
});

describe("give_actor_zat_a23_access_card", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_actor_zat_a23_access_card");
  });
});

describe("give_zat_a23_gauss_rifle_docs", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_zat_a23_gauss_rifle_docs");
  });
});

describe("return_zat_a23_gauss_rifle_docs", () => {
  it("should be registered", () => {
    checkDialogsBinding("return_zat_a23_gauss_rifle_docs");
  });
});

describe("if_actor_has_zat_a23_gauss_rifle_docs", () => {
  it("should be registered", () => {
    checkDialogsBinding("if_actor_has_zat_a23_gauss_rifle_docs");
  });
});

describe("if_actor_has_gauss_rifle", () => {
  it("should be registered", () => {
    checkDialogsBinding("if_actor_has_gauss_rifle");
  });
});

describe("give_tech_gauss_rifle", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_tech_gauss_rifle");
  });
});

describe("give_actor_repaired_gauss_rifle", () => {
  it("should be registered", () => {
    checkDialogsBinding("give_actor_repaired_gauss_rifle");
  });
});

describe("zat_b215_actor_has_money_poor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_money_poor");
  });
});

describe("zat_b215_actor_has_no_money_poor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_no_money_poor");
  });
});

describe("zat_b215_actor_has_money_poor_pripyat", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_money_poor_pripyat");
  });
});

describe("zat_b215_actor_has_no_money_poor_pripyat", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_no_money_poor_pripyat");
  });
});

describe("zat_b215_actor_has_money_rich", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_money_rich");
  });
});

describe("zat_b215_actor_has_no_money_rich", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_no_money_rich");
  });
});

describe("zat_b215_actor_has_money_rich_pripyat", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_money_rich_pripyat");
  });
});

describe("zat_b215_actor_has_no_money_rich_pripyat", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_actor_has_no_money_rich_pripyat");
  });
});

describe("zat_b215_relocate_money_poor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_relocate_money_poor");
  });
});

describe("zat_b215_relocate_money_poor_pripyat", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_relocate_money_poor_pripyat");
  });
});

describe("zat_b215_relocate_money_rich", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_relocate_money_rich");
  });
});

describe("zat_b215_relocate_money_rich_pripyat", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b215_relocate_money_rich_pripyat");
  });
});

describe("zat_b44_actor_has_pda_global", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_actor_has_pda_global");
  });
});

describe("zat_b44_actor_has_not_pda_global", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_actor_has_not_pda_global");
  });
});

describe("zat_b44_actor_has_pda_barge", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_actor_has_pda_barge");
  });
});

describe("zat_b44_actor_has_pda_joker", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_actor_has_pda_joker");
  });
});

describe("zat_b44_actor_has_pda_both", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_actor_has_pda_both");
  });
});

describe("zat_b44_transfer_pda_barge", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_transfer_pda_barge");
  });
});

describe("zat_b44_transfer_pda_joker", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_transfer_pda_joker");
  });
});

describe("zat_b44_transfer_pda_both", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_transfer_pda_both");
  });
});

describe("zat_b44_frends_dialog_enabled", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b44_frends_dialog_enabled");
  });
});

describe("zat_b53_if_actor_has_detector_advanced", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b53_if_actor_has_detector_advanced");
  });
});

describe("zat_b53_transfer_medkit_to_npc", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b53_transfer_medkit_to_npc");
  });
});

describe("is_zat_b106_hunting_time", () => {
  it("should be registered", () => {
    checkDialogsBinding("is_zat_b106_hunting_time");
  });
});

describe("is_not_zat_b106_hunting_time", () => {
  it("should be registered", () => {
    checkDialogsBinding("is_not_zat_b106_hunting_time");
  });
});

describe("zat_b53_if_actor_hasnt_detector_advanced", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b53_if_actor_hasnt_detector_advanced");
  });
});

describe("zat_b53_transfer_detector_advanced_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b53_transfer_detector_advanced_to_actor");
  });
});

describe("zat_b53_transfer_fireball_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b53_transfer_fireball_to_actor");
  });
});

describe("zat_b53_transfer_medkit_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b53_transfer_medkit_to_actor");
  });
});

describe("zat_b106_soroka_reward", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b106_soroka_reward");
  });
});

describe("zat_b103_actor_has_needed_food", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b103_actor_has_needed_food");
  });
});

describe("zat_b106_transfer_weap_to_actor", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b106_transfer_weap_to_actor");
  });
});

describe("zat_b106_give_reward", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b106_give_reward");
  });
});

describe("zat_b3_tech_drinks_precond", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b3_tech_drinks_precond");
  });
});

describe("zat_b106_soroka_gone", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b106_soroka_gone");
  });
});

describe("zat_b106_soroka_not_gone", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b106_soroka_not_gone");
  });
});

describe("zat_b22_actor_has_proof", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b22_actor_has_proof");
  });
});

describe("zat_b22_transfer_proof", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b22_transfer_proof");
  });
});

describe("zat_b5_stalker_transfer_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b5_stalker_transfer_money");
  });
});

describe("zat_b5_dealer_full_revard", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b5_dealer_full_revard");
  });
});

describe("zat_b5_dealer_easy_revard", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b5_dealer_easy_revard");
  });
});

describe("zat_b5_bandits_revard", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b5_bandits_revard");
  });
});

describe("zat_a23_actor_has_access_card", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_a23_actor_has_access_card");
  });
});

describe("zat_a23_transfer_access_card_to_tech", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_a23_transfer_access_card_to_tech");
  });
});

describe("zat_b57_stalker_reward_to_actor_detector", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b57_stalker_reward_to_actor_detector");
  });
});

describe("actor_has_gas", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_gas");
  });
});

describe("actor_has_not_gas", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_not_gas");
  });
});

describe("zat_b57_actor_has_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b57_actor_has_money");
  });
});

describe("zat_b57_actor_hasnt_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b57_actor_hasnt_money");
  });
});

describe("zat_b57_transfer_gas_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("zat_b57_transfer_gas_money");
  });
});

describe("Owl trader money and item predicates", () => {
  it("should enforce both Owl payment thresholds", () => {
    mockRegisteredActor({ money: 199 });
    expect(callDialogsBinding("zat_b30_actor_has_200")).toBe(false);
    expect(callDialogsBinding("zat_b30_actor_has_1000")).toBe(false);

    mockRegisteredActor({ money: 1000 });
    expect(callDialogsBinding("zat_b30_actor_has_200")).toBe(true);
    expect(callDialogsBinding("zat_b30_actor_has_1000")).toBe(true);
  });

  it("should expose every direct Owl quest-item predicate", () => {
    const predicates: Array<[TName, TName]> = [
      ["zat_b30_actor_has_pri_b36_monolith_hiding_place_pda", questItems.pri_b36_monolith_hiding_place_pda],
      ["zat_b30_actor_has_pri_b306_envoy_pda", questItems.pri_b306_envoy_pda],
      ["zat_b30_actor_has_jup_b10_strelok_notes_1", questItems.jup_b10_notes_01],
      ["zat_b30_actor_has_jup_b10_strelok_notes_2", questItems.jup_b10_notes_02],
      ["zat_b30_actor_has_jup_b10_strelok_notes_3", questItems.jup_b10_notes_03],
      ["zat_b30_actor_has_detector_scientific", detectors.detector_scientific],
      ["zat_b30_actor_has_device_flash_snag", questItems.device_flash_snag],
      ["zat_b30_actor_has_device_pda_port_bandit_leader", questItems.device_pda_port_bandit_leader],
      ["zat_b30_actor_has_jup_b10_ufo_memory", questItems.jup_b10_ufo_memory_2],
      ["zat_b30_actor_has_jup_b202_bandit_pda", questItems.jup_b202_bandit_pda],
    ];

    for (const [predicate, item] of predicates) {
      expect(callDialogsBinding(predicate)).toBe(false);

      resetRegistry();
      mockRegisteredActor({ inventory: [[item, MockGameObject.mock({ section: item })]] });
      expect(callDialogsBinding(predicate)).toBe(true);
    }
  });
});

describe("Owl trader exchanges", () => {
  it("should transfer both direct payment amounts to the trader", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b30_transfer_1000", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1000);
    callDialogsBinding("zat_b30_transfer_200", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 200);
  });

  it("should sell each direct trader item for its matching reward", () => {
    const npc: GameObject = MockGameObject.mock();
    const sales: Array<[TName, TName, number, TName | null]> = [
      ["zat_b30_sell_pri_b36_monolith_hiding_place_pda", questItems.pri_b36_monolith_hiding_place_pda, 5000, null],
      ["zat_b30_sell_pri_b306_envoy_pda", questItems.pri_b306_envoy_pda, 4000, null],
      [
        "zat_b30_sell_jup_b207_merc_pda_with_contract",
        questItems.jup_b207_merc_pda_with_contract,
        1000,
        infoPortions.jup_b207_merc_pda_with_contract_sold,
      ],
      ["zat_b30_sell_jup_b10_strelok_notes_1", questItems.jup_b10_notes_01, 500, null],
      ["zat_b30_sell_jup_b10_strelok_notes_2", questItems.jup_b10_notes_02, 500, null],
      ["zat_b30_sell_jup_b10_strelok_notes_3", questItems.jup_b10_notes_03, 500, null],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
        questItems.jup_a9_evacuation_info,
        750,
        infoPortions.jup_a9_evacuation_info_sold,
      ],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
        questItems.jup_a9_meeting_info,
        750,
        infoPortions.jup_a9_meeting_info_sold,
      ],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
        questItems.jup_a9_losses_info,
        750,
        infoPortions.jup_a9_losses_info_sold,
      ],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
        questItems.jup_a9_delivery_info,
        750,
        infoPortions.jup_a9_delivery_info_sold,
      ],
      [
        "zat_b30_owl_stalker_trader_sell_device_flash_snag",
        questItems.device_flash_snag,
        200,
        infoPortions.device_flash_snag_sold,
      ],
      [
        "zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader",
        questItems.device_pda_port_bandit_leader,
        1000,
        infoPortions.device_pda_port_bandit_leader_sold,
      ],
      [
        "zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory",
        questItems.jup_b10_ufo_memory_2,
        500,
        infoPortions.jup_b10_ufo_memory_2_sold,
      ],
      ["zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda", questItems.jup_b202_bandit_pda, 500, null],
    ];

    for (const [binding, item, reward, soldInfo] of sales) {
      resetRegistry();
      mockRegisteredActor({ inventory: [[item, MockGameObject.mock({ section: item })]] });
      resetFunctionMock(giveMoneyToActor);
      resetFunctionMock(transferItemsFromActor);

      callDialogsBinding(binding, [registry.actor, npc]);

      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, item);
      expect(giveMoneyToActor).toHaveBeenCalledWith(reward);

      if (soldInfo) {
        expect(registry.actor.has_info(soldInfo)).toBe(true);
      }
    }
  });
});

describe("Zaton B14 artefact exchange", () => {
  it("should reward the bar task and transfer the twisted artefact", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b14_bar_transfer_money", [registry.actor, npc]);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);

    callDialogsBinding("zat_b14_transfer_artefact", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_quest_b14_twisted);
  });

  it("should check whether the first speaker has the twisted artefact", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("actor_has_artefact", [registry.actor, npc])).toBe(false);

    mockRegisteredActor({
      inventory: [[artefacts.af_quest_b14_twisted, MockGameObject.mock({ section: artefacts.af_quest_b14_twisted })]],
    });
    expect(callDialogsBinding("actor_has_artefact", [registry.actor, npc])).toBe(true);
  });
});
