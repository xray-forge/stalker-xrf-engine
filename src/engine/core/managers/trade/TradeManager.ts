import { time_global } from "xray16";

import { TAnimationSequenceElement } from "@/engine/core/animation/types";
import {
  closeLoadMarker,
  closeSaveMarker,
  loadIniFile,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { ITradeManagerDescriptor } from "@/engine/core/managers/trade/trade_types";
import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";
import { abort, assertNonEmptyString } from "@/engine/core/utils/assertion";
import { parseConditionsList, pickSectionFromCondList, readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  GameObject,
  IniFile,
  NetPacket,
  NetProcessor,
  Optional,
  TNumberId,
  TPath,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "trade" });

/**
 * Manager to handle current trading state / trading items lists for stalker objects.
 * Handles initialization and updating of trading states, manages descriptors with trading information.
 */
export class TradeManager extends AbstractManager {
  /**
   * Initialize trade manager descriptor for provided stalker object.
   */
  public initializeForObject(object: GameObject, iniFilePath: TPath): void {
    logger.info("Initialize trade for:", object.name(), iniFilePath);

    const iniFile: IniFile = loadIniFile(iniFilePath);

    const sellCondlist: Optional<string> = readIniString(iniFile, "trader", "sell_condition", true);
    const buyCondlist: Optional<string> = readIniString(iniFile, "trader", "buy_condition", true);
    const buySuppliesCondlist: Optional<string> = readIniString(iniFile, "trader", "buy_supplies", false);
    const buyItemFactorCondlist: Optional<string> = readIniString(
      iniFile,
      "trader",
      "buy_item_condition_factor",
      false,
      null,
      "0.7"
    );

    if (buyCondlist === null || sellCondlist === null) {
      abort("Wrong trade manager configuration used for game object: '%s'.", object.name());
    }

    registry.trade.set(object.id(), {
      config: iniFile,
      configPath: iniFilePath,
      updateAt: -1,
      resupplyAt: -1,
      sellCondition: parseConditionsList(sellCondlist),
      buyCondition: parseConditionsList(buyCondlist),
      buySupplies: buySuppliesCondlist === null ? null : parseConditionsList(buySuppliesCondlist),
      buyItemFactorCondition: buyItemFactorCondlist === null ? null : parseConditionsList(buyItemFactorCondlist),
      currentSellCondition: null,
      currentBuyCondition: null,
      currentBuySupplies: null,
    } as ITradeManagerDescriptor);
  }

  /**
   * Perform trading schemes update for game object instance.
   *
   * @param object - game object to update trading state
   */
  public updateForObject(object: GameObject): void {
    const tradeDescriptor: Optional<ITradeManagerDescriptor> = registry.trade.get(object.id());
    const now: TTimestamp = time_global();

    // Nothing to update / not time yet:
    if (tradeDescriptor === null || tradeDescriptor.updateAt > now) {
      return;
    }

    tradeDescriptor.updateAt = now + tradeConfig.UPDATE_PERIOD;

    logger.format("Updating trade state for: '%s', next at '%s'", object.name(), tradeDescriptor.updateAt);

    const buyCondition: Optional<TAnimationSequenceElement> = pickSectionFromCondList(
      registry.actor,
      object,
      tradeDescriptor.buyCondition
    );

    assertNonEmptyString(buyCondition, "Wrong section in buy_condition condlist for object '%s'.", object.name());

    if (tradeDescriptor.currentBuyCondition !== buyCondition) {
      object.buy_condition(tradeDescriptor.config, buyCondition);
      tradeDescriptor.currentBuyCondition = buyCondition;
    }

    const sellCondition: Optional<TSection> = pickSectionFromCondList(
      registry.actor,
      object,
      tradeDescriptor.sellCondition
    );

    assertNonEmptyString(sellCondition, "Wrong section in buy_condition condlist for object '%s'.", object.name());

    if (tradeDescriptor.currentSellCondition !== sellCondition) {
      logger.info("Change object sell condition:", object.name(), sellCondition);
      object.sell_condition(tradeDescriptor.config, sellCondition);
      tradeDescriptor.currentSellCondition = sellCondition;
    }

    const buyItemConditionFactor: TRate = tonumber(
      pickSectionFromCondList(registry.actor, object, tradeDescriptor.buyItemFactorCondition)
    )!;

    if (tradeDescriptor.currentBuyItemConditionFactor !== buyItemConditionFactor) {
      logger.info("Change object buy condition factor:", object.name(), sellCondition);
      object.buy_item_condition_factor(buyItemConditionFactor);
      tradeDescriptor.currentBuyItemConditionFactor = buyItemConditionFactor;
    }

    // Not defined or not time to update yet:
    if (tradeDescriptor.buySupplies === null || tradeDescriptor.resupplyAt > now) {
      return;
    }

    const buySupplies: Optional<TSection> = pickSectionFromCondList(
      registry.actor,
      object,
      tradeDescriptor.buySupplies
    );

    assertNonEmptyString(buySupplies, "Wrong section in buy_condition condlist for object '%s'.", object.name());

    if (tradeDescriptor.currentBuySupplies !== buySupplies) {
      logger.info("Change object buy supplies condition:", object.name(), sellCondition);
      object.buy_supplies(tradeDescriptor.config, buySupplies);
      tradeDescriptor.currentBuySupplies = buySupplies;
      tradeDescriptor.resupplyAt = now + tradeConfig.RESUPPLY_PERIOD;
    }
  }

  /**
   * @param objectId - target object ID to get buy discount for
   * @returns discount rate for object ID based on currently active trading section
   */
  public getBuyDiscountForObject(objectId: TNumberId): TRate {
    const tradeDescriptor: ITradeManagerDescriptor = registry.trade.get(objectId);
    const data: string = readIniString(tradeDescriptor.config, "trader", "discounts", false, null, "");

    if (data === "") {
      return 1;
    } else {
      return readIniNumber(
        tradeDescriptor.config,
        pickSectionFromCondList(registry.actor, null, parseConditionsList(data)) as TSection,
        "buy",
        false,
        1
      );
    }
  }

  /**
   * @param objectId - target object ID to get sell discount for
   * @returns discount rate for object ID based on currently active trading section
   */
  public getSellDiscountForObject(objectId: TNumberId): TRate {
    const tradeManagerDescriptor: ITradeManagerDescriptor = registry.trade.get(objectId);
    const data: string = readIniString(tradeManagerDescriptor.config, "trader", "discounts", false, null, "");

    if (data === "") {
      return 1;
    } else {
      return readIniNumber(
        tradeManagerDescriptor.config,
        pickSectionFromCondList(registry.actor, null, parseConditionsList(data))!,
        "sell",
        false,
        1
      );
    }
  }

  /**
   * Save object state in net processor.
   *
   * @param object - game object to save data for
   * @param packet - net packet to save data in
   */
  public saveObjectState(object: GameObject, packet: NetPacket): void {
    const tradeDescriptor: ITradeManagerDescriptor = registry.trade.get(object.id());

    openSaveMarker(packet, TradeManager.name);

    if (tradeDescriptor === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);

      packet.w_stringZ(tradeDescriptor.configPath);
      packet.w_stringZ(tradeDescriptor.currentBuyCondition === null ? "" : tradeDescriptor.currentBuyCondition);
      packet.w_stringZ(tradeDescriptor.currentSellCondition === null ? "" : tradeDescriptor.currentSellCondition);
      packet.w_stringZ(tradeDescriptor.currentBuySupplies === null ? "" : tradeDescriptor.currentBuySupplies);

      const now: TTimestamp = time_global();

      packet.w_s32(tradeDescriptor.updateAt - now);
      packet.w_s32(tradeDescriptor.resupplyAt - now);
    }

    closeSaveMarker(packet, TradeManager.name);
  }

  /**
   * Load state for object and store in registry.
   *
   * @param object - game object to read for
   * @param reader - net processor to read from
   */
  public loadObjectState(object: GameObject, reader: NetProcessor): void {
    openLoadMarker(reader, TradeManager.name);

    const hasTrade: boolean = reader.r_bool();

    if (hasTrade) {
      const descriptor: ITradeManagerDescriptor = {} as ITradeManagerDescriptor;

      registry.trade.set(object.id(), descriptor);

      descriptor.configPath = reader.r_stringZ();
      descriptor.config = loadIniFile(descriptor.configPath);

      const buyCondition: string = reader.r_stringZ();

      if (buyCondition !== "") {
        descriptor.currentBuyCondition = buyCondition;
        object.buy_condition(descriptor.config, buyCondition);
      }

      const sellCondition: string = reader.r_stringZ();

      if (sellCondition !== "") {
        descriptor.currentSellCondition = sellCondition;
        object.sell_condition(descriptor.config, sellCondition);
      }

      const buySupplies: string = reader.r_stringZ();

      if (buySupplies !== "") {
        descriptor.currentBuySupplies = buySupplies;
      }

      const now: TTimestamp = time_global();

      descriptor.updateAt = now + reader.r_s32();
      descriptor.resupplyAt = now + reader.r_s32();
    }

    closeLoadMarker(reader, TradeManager.name);
  }
}
