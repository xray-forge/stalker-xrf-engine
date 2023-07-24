import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { getExtern } from "@/engine/core/utils/binding";
import { AnyCallablesModule } from "@/engine/lib/types";
import { checkBinding, checkNestedBinding } from "@/fixtures/engine";

describe("'interface' external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/interface");
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("ui_wpn_params");
    checkNestedBinding("ui_wpn_params", "GetRPM");
    checkNestedBinding("ui_wpn_params", "GetDamage");
    checkNestedBinding("ui_wpn_params", "GetDamageMP");
    checkNestedBinding("ui_wpn_params", "GetHandling");
    checkNestedBinding("ui_wpn_params", "GetAccuracy");

    checkBinding("inventory_upgrades");
    checkNestedBinding("inventory_upgrades", "get_upgrade_cost");
    checkNestedBinding("inventory_upgrades", "can_repair_item");
    checkNestedBinding("inventory_upgrades", "can_upgrade_item");
    checkNestedBinding("inventory_upgrades", "effect_repair_item");
    checkNestedBinding("inventory_upgrades", "effect_functor_a");
    checkNestedBinding("inventory_upgrades", "prereq_functor_a");
    checkNestedBinding("inventory_upgrades", "precondition_functor_a");
    checkNestedBinding("inventory_upgrades", "property_functor_a");
    checkNestedBinding("inventory_upgrades", "property_functor_b");
    checkNestedBinding("inventory_upgrades", "property_functor_c");
    checkNestedBinding("inventory_upgrades", "question_repair_item");

    checkBinding("pda");
    checkNestedBinding("pda", "set_active_subdialog");
    checkNestedBinding("pda", "fill_fraction_state");
    checkNestedBinding("pda", "get_max_resource");
    checkNestedBinding("pda", "get_max_power");
    checkNestedBinding("pda", "get_max_member_count");
    checkNestedBinding("pda", "actor_menu_mode");
    checkNestedBinding("pda", "property_box_clicked");
    checkNestedBinding("pda", "property_box_add_properties");
    checkNestedBinding("pda", "get_monster_back");
    checkNestedBinding("pda", "get_monster_icon");
    checkNestedBinding("pda", "get_favorite_weapon");
    checkNestedBinding("pda", "get_stat");

    checkBinding("actor_menu_inventory");
    checkNestedBinding("actor_menu_inventory", "CUIActorMenu_OnItemDropped");

    checkBinding("actor_menu");
    checkNestedBinding("actor_menu", "actor_menu_mode");
  });

  it("should correctly get tips from manager", () => {
    checkBinding("loadscreen");
    checkNestedBinding("loadscreen", "get_tip_number");
    checkNestedBinding("loadscreen", "get_mp_tip_number");

    const loadScreenManager: LoadScreenManager = LoadScreenManager.getInstance();

    jest.spyOn(loadScreenManager, "getRandomMultiplayerTipIndex");
    jest.spyOn(loadScreenManager, "getRandomTipIndex");

    expect(typeof getExtern<AnyCallablesModule>("loadscreen").get_tip_number()).toBe("number");
    expect(typeof getExtern<AnyCallablesModule>("loadscreen").get_mp_tip_number()).toBe("number");

    expect(loadScreenManager.getRandomTipIndex).toHaveBeenCalledTimes(1);
    expect(loadScreenManager.getRandomMultiplayerTipIndex).toHaveBeenCalledTimes(1);
  });
});
