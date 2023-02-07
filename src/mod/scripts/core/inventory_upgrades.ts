import { game, ini_file, system_ini, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/configuration";
import { getActor } from "@/mod/scripts/core/db";
import { parseCondList, parseNames, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("inventory_upgrades");
const char_ini: XR_ini_file = new ini_file("item_upgrades.ltx");
const param_ini: XR_ini_file = new ini_file("misc\\stalkers_upgrade_info.ltx");

export let cur_hint: Optional<LuaTable> = null;
let victim: Optional<XR_game_object> = null;
let mechanic_name: string = "";
let cur_price_percent = 1;

export function precondition_functor_a(param1: unknown, section: string): 0 | 1 | 2 {
  if (param_ini.line_exist(mechanic_name + "_upgr", section)) {
    const param: string = param_ini.r_string(mechanic_name + "_upgr", section);

    if (param !== null) {
      if (param === "false") {
        return 1;
      } else if (param !== "true") {
        const possibility_table = parseCondList(victim, mechanic_name + "_upgr", section, param);
        const possibility: Optional<TSection> = pickSectionFromCondList(getActor(), victim, possibility_table);

        if (!possibility || possibility === "false") {
          return 2;
        }
      }
    }
  }

  const actor = getActor();

  if (actor !== null) {
    const price: number = math.floor(char_ini.r_u32(section, "cost") * cur_price_percent);
    const cash: number = actor.money();

    if (cash < price) {
      return 2;
    }
  }

  return 0;
}

export function effect_functor_a(param2: unknown, section: string, loading: number): void {
  // --( string, string, int )
  if (loading === 0) {
    const money = char_ini.r_u32(section, "cost");

    getActor()!.give_money(math.floor(money * -1 * cur_price_percent));
  }
}

export function effect_repair_item(item_name: string, item_condition: number): void {
  if (mechanic_name !== "kat_cs_commander") {
    const price = how_much_repair(item_name, item_condition);

    getActor()!.give_money(-price);
  }
}

export function get_upgrade_cost(section: string): string {
  if (getActor() !== null) {
    const price = math.floor(char_ini.r_u32(section, "cost") * cur_price_percent);

    return game.translate_string("st_upgr_cost") + ": " + price;
  }

  return " ";
}

export function get_possibility_string(mechanic_name: string, possibility_table: LuaTable): string {
  let str = "";

  if (cur_hint !== null) {
    for (const [k, v] of cur_hint) {
      str = str + "\\n - " + game.translate_string(v);
    }
  }

  if (str === "") {
    str = " - add hints for this upgrade";
  }

  return str;
}

export function prereq_functor_a(param3: unknown, section: string): string {
  const actor: Optional<XR_game_object> = getActor();
  let str: string = "";

  if (param_ini.line_exist(mechanic_name + "_upgr", section)) {
    const param: string = param_ini.r_string(mechanic_name + "_upgr", section);

    if (param !== null) {
      if (param === "false") {
        return str;
      } else {
        cur_hint = null;

        const possibility_table = parseCondList(victim, mechanic_name + "_upgr", section, param);
        const possibility = pickSectionFromCondList(actor, victim, possibility_table);

        if (!possibility || possibility === "false") {
          str = str + get_possibility_string(mechanic_name, possibility_table);
        }
      }
    }
  }

  if (actor !== null) {
    const price = math.floor(char_ini.r_u32(section, "cost") * cur_price_percent);
    const cash = actor.money();

    if (cash < price) {
      return str + "\\n - " + game.translate_string("st_upgr_enough_money"); // --.." "..price-cash.." RU"
    }
  }

  return str;
}

export function property_functor_a(param1: string, name: string): string {
  const prorerty_name = char_ini.r_string(name, "name");
  const t_prorerty_name = game.translate_string(prorerty_name);
  const section_table: LuaTable<number, string> = parseNames(param1);
  const section_table_n = section_table.length();

  if (section_table_n === 0) {
    return "";
  }

  let value: string = "0";
  let sum = 0;

  for (const i of $range(1, section_table_n)) {
    if (!char_ini.line_exist(section_table.get(i), "value") || !char_ini.r_string(section_table.get(i), "value")) {
      return t_prorerty_name;
    }

    value = char_ini.r_string(section_table.get(i), "value");
    if (name !== "prop_night_vision") {
      sum = sum + tonumber(value)!;
    } else {
      sum = tonumber(value)!;
    }
  }

  if (sum < 0) {
    value = tostring(sum);
  } else {
    value = "+" + sum;
  }

  if (name === "prop_ammo_size" || name === "prop_artefact") {
    return t_prorerty_name + " " + value;
  } else if (name === "prop_restore_bleeding" || name === "prop_restore_health" || name === "prop_power") {
    if (name === "prop_power") {
      value = "+" + tonumber(value)! * 2;
    }

    // --        const str = string.format("%s %4.1f", t_prorerty_name, value)
    // --        return str
    return t_prorerty_name + " " + value;
  } else if (name === "prop_tonnage" || name === "prop_weightoutfit" || name === "prop_weight") {
    const str = string.format("%s %5.2f %s", t_prorerty_name, value, game.translate_string("st_kg"));

    return str;
  } else if (name === "prop_night_vision") {
    if (tonumber(value) === 1) {
      return t_prorerty_name;
    } else {
      return game.translate_string(prorerty_name + "_" + tonumber(value));
    }
  } else if (name === "prop_no_buck" || name === "prop_autofire") {
    return t_prorerty_name;
  }

  return t_prorerty_name + " " + value + "%";
}

export function property_functor_b(param1: string, name: string) {
  return issue_property(param1, name);
}

export function property_functor_c(param1: string, name: string) {
  return issue_property(param1, name);
}

export function need_victim(obj: XR_game_object): void {
  victim = obj;
}

export function issue_property(param1: string, name: string) {
  const prorerty_name = char_ini.r_string(name, "name");
  const t_prorerty_name = game.translate_string(prorerty_name);
  const value_table = parseNames(param1);
  const section = value_table.get(1);

  if (section !== null) {
    if (!char_ini.line_exist(section, "value") || !char_ini.r_string(section, "value")) {
      return t_prorerty_name;
    }

    const value = char_ini.r_string(section, "value");

    return t_prorerty_name + " " + string.sub(value, 2, -2);
  } else {
    return t_prorerty_name;
  }
}

export function how_much_repair(item_name: string, item_condition: number): number {
  const ltx: XR_ini_file = system_ini();
  const cost: number = ltx.r_u32(item_name, "cost");
  const cls: string = ltx.r_string(item_name, "class");

  const cof: number = 0.6;

  return math.floor(cost * (1 - item_condition) * cof * cur_price_percent);
}

export function can_repair_item(item_name: string, item_condition: number, mechanic: string): boolean {
  // --( string, float, string )
  if (item_name === "pri_a17_gauss_rifle") {
    return false;
  }

  const price = how_much_repair(item_name, item_condition);

  return getActor()!.money() >= price;
}

export function question_repair_item(
  item_name: string,
  item_condition: number,
  can: boolean,
  mechanic: string
): string {
  // --( string, float, bool, string )
  if (item_name === "pri_a17_gauss_rifle") {
    return game.translate_string("st_gauss_cannot_be_repaired");
  }

  const price = how_much_repair(item_name, item_condition);

  if (getActor()!.money() < price) {
    return (
      game.translate_string("st_upgr_cost") +
      ": " +
      price +
      " RU\\n" +
      game.translate_string("ui_inv_not_enought_money") +
      ": " +
      (price - getActor()!.money()) +
      " RU"
    );
  }

  return game.translate_string("st_upgr_cost") + " " + price + " RU. " + game.translate_string("ui_inv_repair") + "?";
}

export function mech_discount(perc: number) {
  cur_price_percent = perc;
}

export function can_upgrade_item(item_name: string, mechanic: string) {
  mechanic_name = mechanic;
  setup_discounts();
  if (param_ini.line_exist(mechanic, "he_upgrade_nothing")) {
    return false;
  }

  if (!param_ini.line_exist(mechanic, item_name)) {
    return false;
  }

  return true;
}

export function setup_discounts(): void {
  if (param_ini.line_exist(mechanic_name, "discount_condlist")) {
    const condlist = param_ini.r_string(mechanic_name, "discount_condlist");
    const parsed = parseCondList(getActor(), null, null, condlist);

    get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), null, parsed);
  }
}

export function getInventoryVictim(): Optional<XR_game_object> {
  return victim;
}

export const inventory_upgrades_functors = {
  get_upgrade_cost,
  can_repair_item,
  can_upgrade_item,
  effect_repair_item,
  effect_functor_a,
  prereq_functor_a,
  precondition_functor_a,
  property_functor_a,
  property_functor_b,
  property_functor_c,
  question_repair_item,
};
