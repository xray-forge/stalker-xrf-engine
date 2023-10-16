import { game } from "xray16";

import { ITEM_UPGRADES, registry, STALKER_UPGRADE_INFO, SYSTEM_INI } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { isObjectTrader } from "@/engine/core/managers/trade/utils";
import { TItemUpgradeBranch } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { addRandomUpgrades } from "@/engine/core/managers/upgrades/utils/upgrades_install";
import {
  parseConditionsList,
  parseStringsList,
  pickSectionFromCondList,
  TConditionList,
} from "@/engine/core/utils/ini";
import { getItemOwnerId } from "@/engine/core/utils/item";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { ClientObject, LuaArray, Optional, TCount, TLabel, TName, TNumberId, TRate } from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class UpgradesManager extends AbstractManager {
  public upgradeHints: Optional<LuaArray<TLabel>> = null;
  public currentMechanicName: TName = "";
  public currentPriceDiscountRate: TRate = 1;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, this.onItemGoOnlineFirstTime, this);
    eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_GO_ONLINE_FIRST_TIME, this.onItemGoOnlineFirstTime, this);
    eventsManager.registerCallback(EGameEvent.ITEM_HELMET_GO_ONLINE_FIRST_TIME, this.onItemGoOnlineFirstTime, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, this.onItemGoOnlineFirstTime);
    eventsManager.unregisterCallback(EGameEvent.ITEM_OUTFIT_GO_ONLINE_FIRST_TIME, this.onItemGoOnlineFirstTime);
    eventsManager.unregisterCallback(EGameEvent.ITEM_HELMET_GO_ONLINE_FIRST_TIME, this.onItemGoOnlineFirstTime);
  }

  /**
   * todo: Description.
   */
  public setCurrentHints(hints: LuaArray<TLabel>): void {
    this.upgradeHints = hints;
  }

  /**
   * todo: Description.
   */
  public setupDiscounts(): void {
    if (STALKER_UPGRADE_INFO.line_exist(this.currentMechanicName, "discount_condlist")) {
      const data: string = STALKER_UPGRADE_INFO.r_string(this.currentMechanicName, "discount_condlist");
      const conditionsList: TConditionList = parseConditionsList(data);

      pickSectionFromCondList(registry.actor, null, conditionsList);
    }
  }

  /**
   * todo: Description.
   */
  public getRepairPrice(itemSection: TSection, itemCondition: TRate): TCount {
    const cost: TCount = SYSTEM_INI.r_u32(itemSection, "cost");

    return math.floor(
      cost * (1 - itemCondition) * upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT * this.currentPriceDiscountRate
    );
  }

  /**
   * todo: Description.
   */
  public getRepairItemPayment(itemName: TName, itemCondition: TRate): void {
    registry.actor.give_money(-this.getRepairPrice(itemName, itemCondition));
  }

  /**
   * todo: Description.
   */
  public getUpgradeCost(section: TSection): TLabel {
    if (registry.actor !== null) {
      const price: TCount = math.floor(ITEM_UPGRADES.r_u32(section, "cost") * this.currentPriceDiscountRate);

      return game.translate_string("st_upgr_cost") + ": " + price;
    }

    return " ";
  }

  /**
   * todo: Description.
   */
  public getPossibilitiesLabel(mechanicName: TName, possibilities: TConditionList): TLabel {
    let hintsLabel: TLabel = "";

    if (this.upgradeHints !== null) {
      for (const [, caption] of this.upgradeHints) {
        hintsLabel = hintsLabel + "\\n - " + game.translate_string(caption);
      }
    }

    if (hintsLabel === "") {
      hintsLabel = " - add hints for this upgrade";
    }

    return hintsLabel;
  }

  /**
   * todo: Description.
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
   * todo: Description.
   */
  public setCurrentPriceDiscount(percent: TRate): void {
    this.currentPriceDiscountRate = percent;
  }

  /**
   * todo: Description.
   */
  public isAbleToRepairItem(itemName: TName, itemCondition: number, mechanicName: TName): boolean {
    if (itemName === questItems.pri_a17_gauss_rifle) {
      return false;
    }

    return registry.actor.money() >= this.getRepairPrice(itemName, itemCondition);
  }

  /**
   * todo: Description.
   */
  public getRepairItemAskReplicLabel(
    itemName: TName,
    itemCondition: number,
    canRepair: boolean,
    mechanicName: TName
  ): TLabel {
    if (itemName === questItems.pri_a17_gauss_rifle) {
      return game.translate_string("st_gauss_cannot_be_repaired");
    }

    const price: TCount = this.getRepairPrice(itemName, itemCondition);

    if (registry.actor.money() < price) {
      // Price is: N $\n
      // Not enough money: N $
      return string.format(
        "%s: %s RU\\n%s: %s %s",
        game.translate_string("st_upgr_cost"),
        price,
        game.translate_string("ui_inv_not_enought_money"),
        price - registry.actor.money(),
        gameConfig.CURRENCY
      );
    }

    // Price N $. Repair?
    return string.format(
      "%s %s %s. %s?",
      game.translate_string("st_upgr_cost"),
      price,
      gameConfig.CURRENCY,
      game.translate_string("ui_inv_repair")
    );
  }

  /**
   * todo: Description.
   */
  public getPreconditionFunctorA(name: TName, section: TSection): TItemUpgradeBranch {
    if (STALKER_UPGRADE_INFO.line_exist(this.currentMechanicName + "_upgr", section)) {
      const param: string = STALKER_UPGRADE_INFO.r_string(this.currentMechanicName + "_upgr", section);

      if (param !== null) {
        if (param === FALSE) {
          return 1;
        } else if (param !== TRUE) {
          const possibilitiesConditionList: TConditionList = parseConditionsList(param);
          const possibility: Optional<TSection> = pickSectionFromCondList(
            registry.actor,
            registry.activeSpeaker,
            possibilitiesConditionList
          );

          if (!possibility || possibility === FALSE) {
            return 2;
          }
        }
      }
    }

    if (registry.actor !== null) {
      const price: TCount = math.floor(ITEM_UPGRADES.r_u32(section, "cost") * this.currentPriceDiscountRate);
      const cash: TCount = registry.actor.money();

      if (cash < price) {
        return 2;
      }
    }

    return 0;
  }

  /**
   * todo: Description.
   */
  public getPreRequirementsFunctorA(name: TName, section: TSection): TLabel {
    const actor: ClientObject = registry.actor;
    let label: TLabel = "";

    if (STALKER_UPGRADE_INFO.line_exist(this.currentMechanicName + "_upgr", section)) {
      const param: string = STALKER_UPGRADE_INFO.r_string(this.currentMechanicName + "_upgr", section);

      if (param !== null) {
        if (param === FALSE) {
          return label;
        } else {
          this.upgradeHints = null;

          const possibilitiesConditionList: TConditionList = parseConditionsList(param);
          const possibility: Optional<TSection> = pickSectionFromCondList(
            actor,
            registry.activeSpeaker,
            possibilitiesConditionList
          );

          if (!possibility || possibility === FALSE) {
            label = label + this.getPossibilitiesLabel(this.currentMechanicName, possibilitiesConditionList);
          }
        }
      }
    }

    if (actor !== null) {
      const price: TCount = math.floor(ITEM_UPGRADES.r_u32(section, "cost") * this.currentPriceDiscountRate);

      if (actor.money() < price) {
        return string.format("%s\\n - %s", label, game.translate_string("st_upgr_enough_money"));
      }
    }

    return label;
  }

  /**
   * todo: Description.
   */
  public useEffectFunctorA(name: TName, section: TSection, loading: number): void {
    if (loading === 0) {
      const money: TCount = ITEM_UPGRADES.r_u32(section, "cost");

      registry.actor.give_money(math.floor(money * -1 * this.currentPriceDiscountRate));
    }
  }

  /**
   * todo: Description.
   */
  public getPropertyFunctorA(data: string, name: TName): TLabel {
    const propertyName: TName = ITEM_UPGRADES.r_string(name, "name");
    const translatedPropertyName: TLabel = game.translate_string(propertyName);

    const sections: LuaArray<TSection> = parseStringsList(data);
    const sectionsCount: TCount = sections.length();

    if (sectionsCount === 0) {
      return "";
    }

    let value: string = "0";
    let sum: TCount = 0;

    for (const it of $range(1, sectionsCount)) {
      if (!ITEM_UPGRADES.line_exist(sections.get(it), "value") || !ITEM_UPGRADES.r_string(sections.get(it), "value")) {
        return translatedPropertyName;
      }

      value = ITEM_UPGRADES.r_string(sections.get(it), "value");
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
      return translatedPropertyName + " " + value;
    } else if (name === "prop_restore_bleeding" || name === "prop_restore_health" || name === "prop_power") {
      if (name === "prop_power") {
        value = "+" + tonumber(value)! * 2;
      }

      // --        const str = string.format("%s %4.1f", t_prorerty_name, value)
      // --        return str
      return translatedPropertyName + " " + value;
    } else if (name === "prop_tonnage" || name === "prop_weightoutfit" || name === "prop_weight") {
      const str: string = string.format("%s %5.2f %s", translatedPropertyName, value, game.translate_string("st_kg"));

      return str;
    } else if (name === "prop_night_vision") {
      if (tonumber(value) === 1) {
        return translatedPropertyName;
      } else {
        return game.translate_string(propertyName + "_" + tonumber(value));
      }
    } else if (name === "prop_no_buck" || name === "prop_autofire") {
      return translatedPropertyName;
    }

    return translatedPropertyName + " " + value + "%";
  }

  /**
   * todo: Description.
   */
  public getPropertyFunctorB(data: string, name: TName): TName {
    return this.issueProperty(data, name);
  }

  /**
   * todo: Description.
   */
  public getPropertyFunctorC(data: string, name: TName): TName {
    return this.issueProperty(data, name);
  }

  /**
   * todo: Description.
   */
  public issueProperty(data: string, name: TName): TName {
    const propertyName: TLabel = game.translate_string(ITEM_UPGRADES.r_string(name, "name"));
    const values: LuaArray<string> = parseStringsList(data);
    const section: Optional<TSection> = values.get(1);

    if (section === null) {
      return propertyName;
    } else {
      if (!ITEM_UPGRADES.line_exist(section, "value") || !ITEM_UPGRADES.r_string(section, "value")) {
        return propertyName;
      }

      return string.format("%s %s", propertyName, string.sub(ITEM_UPGRADES.r_string(section, "value"), 2, -2));
    }
  }

  /**
   * Handle item going online (spawning) first time.
   *
   * @param object - game object of item switching online
   */
  public onItemGoOnlineFirstTime(object: ClientObject): void {
    if (!upgradesConfig.ADD_RANDOM_UPGRADES) {
      return;
    }

    const ownerId: Optional<TNumberId> = getItemOwnerId(object.id());

    // Do not upgrade actor spawned items.
    if (ownerId === ACTOR_ID) {
      return;
    }

    let chance: TRate = math.random(100);
    const dispersion: TCount = upgradesConfig.ADD_RANDOM_DISPERSION * math.random();

    // Apply different rate for trader / owned / world.
    if (ownerId && isObjectTrader(ownerId)) {
      logger.info("TRADER RATE APPLY", object.name(), object.id(), ownerId);
      chance /= upgradesConfig.ADD_RANDOM_RATE_TRADER;
    } else if (ownerId) {
      logger.info("OWNED RATE APPLY", object.name(), object.id(), ownerId);
      chance /= upgradesConfig.ADD_RANDOM_RATE_OWNED;
    } else {
      logger.info("WORLD RATE APPLY", object.name(), object.id(), ownerId);
      chance /= upgradesConfig.ADD_RANDOM_RATE_WORLD;
    }

    if (chance <= upgradesConfig.ADD_RANDOM_LEGENDARY_CHANCE) {
      return addRandomUpgrades(object, upgradesConfig.ADD_RANDOM_LEGENDARY_COUNT + dispersion);
    } else if (chance <= upgradesConfig.ADD_RANDOM_EPIC_CHANCE) {
      return addRandomUpgrades(object, upgradesConfig.ADD_RANDOM_EPIC_COUNT + dispersion);
    } else if (chance <= upgradesConfig.ADD_RANDOM_RARE_CHANCE) {
      return addRandomUpgrades(object, upgradesConfig.ADD_RANDOM_RARE_COUNT + dispersion);
    } else if (chance <= upgradesConfig.ADD_RANDOM_CHANCE) {
      return addRandomUpgrades(object, upgradesConfig.ADD_RANDOM_COUNT + dispersion);
    }
  }
}
