import { game, XR_game_object } from "xray16";

import { captions, TCaption } from "@/mod/globals/captions";
import { quest_items } from "@/mod/globals/items/quest_items";
import { STRINGIFIED_FALSE, STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { LuaArray, Optional, TCount, TLabel, TName, TRate } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/scheme";
import { ITEM_UPGRADES, registry, STALKER_UPGRADE_INFO, SYSTEM_INI } from "@/mod/scripts/core/database";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList, parseNames, TConditionList } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("ItemUpgradesManager");

/**
 * todo;
 */
export type TItemUpgradeBranch = 0 | 1 | 2;

/**
 * todo;
 */
export class ItemUpgradesManager extends AbstractCoreManager {
  public static readonly ITEM_REPAIR_PRICE_COEFFICIENT: TRate = 0.6;

  public upgradeHints: Optional<LuaArray<TCaption>> = null;
  public currentSpeaker: Optional<XR_game_object> = null;
  public currentMechanicName: TName = "";
  public currentPriceDiscountRate: TRate = 1;

  /**
   * todo;
   */
  public getCurrentSpeaker(): Optional<XR_game_object> {
    return this.currentSpeaker;
  }

  /**
   * todo;
   */
  public setCurrentTech(object: XR_game_object): void {
    this.currentSpeaker = object;
  }

  /**
   * todo;
   */
  public setCurrentHints(hints: LuaArray<TCaption>): void {
    this.upgradeHints = hints;
  }

  /**
   * todo;
   */
  public setupDiscounts(): void {
    if (STALKER_UPGRADE_INFO.line_exist(this.currentMechanicName, "discount_condlist")) {
      const condlist = STALKER_UPGRADE_INFO.r_string(this.currentMechanicName, "discount_condlist");
      const parsed = parseConditionsList(registry.actor, null, null, condlist);

      pickSectionFromCondList(registry.actor, null, parsed);
    }
  }

  /**
   * todo;
   */
  public getRepairPrice(itemName: TName, itemCondition: TRate): TCount {
    const cost: TCount = SYSTEM_INI.r_u32(itemName, "cost");

    return math.floor(
      cost * (1 - itemCondition) * ItemUpgradesManager.ITEM_REPAIR_PRICE_COEFFICIENT * this.currentPriceDiscountRate
    );
  }

  /**
   * todo;
   */
  public getRepairItemPayment(itemName: TName, itemCondition: TRate): void {
    registry.actor.give_money(-this.getRepairPrice(itemName, itemCondition));
  }

  /**
   * todo;
   */
  public getUpgradeCost(section: TSection): TLabel {
    if (registry.actor !== null) {
      const price: TCount = math.floor(ITEM_UPGRADES.r_u32(section, "cost") * this.currentPriceDiscountRate);

      return game.translate_string(captions.st_upgr_cost) + ": " + price;
    }

    return " ";
  }

  /**
   * todo;
   */
  public getPossibilitiesLabel(mechanicName: TName, possibilities: TConditionList): TLabel {
    let hintsLabel: TLabel = "";

    if (this.upgradeHints !== null) {
      for (const [index, caption] of this.upgradeHints) {
        hintsLabel = hintsLabel + "\\n - " + game.translate_string(caption);
      }
    }

    if (hintsLabel === "") {
      hintsLabel = " - add hints for this upgrade";
    }

    return hintsLabel;
  }

  /**
   * todo;
   */
  public canUpgradeItem(itemName: TName, mechanicName: TName): boolean {
    this.currentMechanicName = mechanicName;
    this.setupDiscounts();

    if (STALKER_UPGRADE_INFO.line_exist(mechanicName, "he_upgrade_nothing")) {
      return false;
    }

    if (!STALKER_UPGRADE_INFO.line_exist(mechanicName, itemName)) {
      return false;
    }

    return true;
  }

  /**
   * todo;
   */
  public setCurrentPriceDiscount(percent: TRate): void {
    this.currentPriceDiscountRate = percent;
  }

  /**
   * todo;
   */
  public isAbleToRepairItem(itemName: TName, itemCondition: number, mechanicName: TName): boolean {
    if (itemName === quest_items.pri_a17_gauss_rifle) {
      return false;
    }

    return registry.actor.money() >= this.getRepairPrice(itemName, itemCondition);
  }

  /**
   * todo;
   */
  public getRepairItemAskReplicLabel(
    itemName: TName,
    itemCondition: number,
    canRepair: boolean,
    mechanicName: TName
  ): TLabel {
    if (itemName === quest_items.pri_a17_gauss_rifle) {
      return game.translate_string(captions.st_gauss_cannot_be_repaired);
    }

    const price: TCount = this.getRepairPrice(itemName, itemCondition);

    if (registry.actor.money() < price) {
      return (
        game.translate_string(captions.st_upgr_cost) +
        ": " +
        price +
        " RU\\n" +
        game.translate_string(captions.ui_inv_not_enought_money) +
        ": " +
        (price - registry.actor.money()) +
        " RU"
      );
    }

    return (
      game.translate_string(captions.st_upgr_cost) +
      " " +
      price +
      " RU. " +
      game.translate_string(captions.ui_inv_repair) +
      "?"
    );
  }

  /**
   * todo;
   */
  public getPreconditionFunctorA(name: TName, section: TSection): TItemUpgradeBranch {
    if (STALKER_UPGRADE_INFO.line_exist(this.currentMechanicName + "_upgr", section)) {
      const param: string = STALKER_UPGRADE_INFO.r_string(this.currentMechanicName + "_upgr", section);

      if (param !== null) {
        if (param === STRINGIFIED_FALSE) {
          return 1;
        } else if (param !== STRINGIFIED_TRUE) {
          const possibility_table = parseConditionsList(
            this.currentSpeaker,
            this.currentMechanicName + "_upgr",
            section,
            param
          );
          const possibility: Optional<TSection> = pickSectionFromCondList(
            registry.actor,
            this.currentSpeaker,
            possibility_table
          );

          if (!possibility || possibility === STRINGIFIED_FALSE) {
            return 2;
          }
        }
      }
    }

    const actor = registry.actor;

    if (actor !== null) {
      const price: TCount = math.floor(ITEM_UPGRADES.r_u32(section, "cost") * this.currentPriceDiscountRate);
      const cash: TCount = actor.money();

      if (cash < price) {
        return 2;
      }
    }

    return 0;
  }

  /**
   * todo;
   */
  public getPreRequirementsFunctorA(name: TName, section: TSection): TLabel {
    const actor: XR_game_object = registry.actor;
    let label: TLabel = "";

    if (STALKER_UPGRADE_INFO.line_exist(this.currentMechanicName + "_upgr", section)) {
      const param: string = STALKER_UPGRADE_INFO.r_string(this.currentMechanicName + "_upgr", section);

      if (param !== null) {
        if (param === STRINGIFIED_FALSE) {
          return label;
        } else {
          this.upgradeHints = null;

          const possibility_table = parseConditionsList(
            this.currentSpeaker,
            this.currentMechanicName + "_upgr",
            section,
            param
          );
          const possibility = pickSectionFromCondList(actor, this.currentSpeaker, possibility_table);

          if (!possibility || possibility === STRINGIFIED_FALSE) {
            label = label + this.getPossibilitiesLabel(this.currentMechanicName, possibility_table);
          }
        }
      }
    }

    if (actor !== null) {
      const price = math.floor(ITEM_UPGRADES.r_u32(section, "cost") * this.currentPriceDiscountRate);
      const cash = actor.money();

      if (cash < price) {
        return label + "\\n - " + game.translate_string(captions.st_upgr_enough_money); // --.." "..price-cash.." RU"
      }
    }

    return label;
  }

  /**
   * todo;
   */
  public useEffectFunctorA(name: TName, section: TSection, loading: number): void {
    if (loading === 0) {
      const money: TCount = ITEM_UPGRADES.r_u32(section, "cost");

      registry.actor.give_money(math.floor(money * -1 * this.currentPriceDiscountRate));
    }
  }

  /**
   * todo;
   */
  public getPropertyFunctorA(data: string, name: TName): TLabel {
    const prorerty_name = ITEM_UPGRADES.r_string(name, "name");
    const t_prorerty_name = game.translate_string(prorerty_name);
    const section_table: LuaArray<TSection> = parseNames(data);
    const section_table_n = section_table.length();

    if (section_table_n === 0) {
      return "";
    }

    let value: string = "0";
    let sum = 0;

    for (const it of $range(1, section_table_n)) {
      if (
        !ITEM_UPGRADES.line_exist(section_table.get(it), "value") ||
        !ITEM_UPGRADES.r_string(section_table.get(it), "value")
      ) {
        return t_prorerty_name;
      }

      value = ITEM_UPGRADES.r_string(section_table.get(it), "value");
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

  /**
   * todo;
   */
  public getPropertyFunctorB(data: string, name: TName): TName {
    return this.issueProperty(data, name);
  }

  /**
   * todo;
   */
  public getPropertyFunctorC(data: string, name: TName): TName {
    return this.issueProperty(data, name);
  }

  /**
   * todo;
   */
  public issueProperty(data: string, name: TName): TName {
    const propertyName: TName = game.translate_string(ITEM_UPGRADES.r_string(name, "name"));
    const value_table: LuaArray<string> = parseNames(data);
    const section = value_table.get(1);

    if (section !== null) {
      if (!ITEM_UPGRADES.line_exist(section, "value") || !ITEM_UPGRADES.r_string(section, "value")) {
        return propertyName;
      }

      return propertyName + " " + string.sub(ITEM_UPGRADES.r_string(section, "value"), 2, -2);
    } else {
      return propertyName;
    }
  }
}
