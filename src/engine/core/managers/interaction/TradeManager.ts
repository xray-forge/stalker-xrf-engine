import { ini_file, time_global } from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry } from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { parseConditionsList } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  ClientObject,
  IniFile,
  NetPacket,
  NetProcessor,
  Optional,
  TDuration,
  TNumberId,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export interface ITradeManagerDescriptor {
  cfg_ltx: string;
  config: IniFile;
  update_time: number;
  buy_condition: LuaTable<number>;
  sell_condition: LuaTable<number>;
  buy_supplies: LuaTable<number>;
  buy_item_condition_factor: LuaTable<number>;
  resuply_time: number;
  current_buy_condition: string;
  current_sell_condition: string;
  current_buy_item_condition_factor: number;
  current_buy_supplies: string;
}

/**
 * todo;
 */
export class TradeManager extends AbstractCoreManager {
  public static readonly TRADE_UPDATE_PERIOD: TDuration = 3_600_000;
  public static readonly TRADE_RESUPPLY_PERIOD: TDuration = 24 * 3_600_000;

  /**
   * todo
   */
  public initForObject(object: ClientObject, configFilePath: string): void {
    logger.info("Init trade for:", object.name(), configFilePath);

    const objectId: TNumberId = object.id();

    registry.trade.set(objectId, {} as any);
    registry.trade.get(objectId).cfg_ltx = configFilePath;
    registry.trade.get(objectId).config = new ini_file(configFilePath);

    let data = readIniString(registry.trade.get(objectId).config, "trader", "buy_condition", true, "");

    if (data === null) {
      abort("Incorrect trader settings. Cannot find buy_condition. [%s]->[%s]", object.name(), configFilePath);
    }

    registry.trade.get(objectId).buy_condition = parseConditionsList(data);

    data = readIniString(registry.trade.get(objectId).config, "trader", "sell_condition", true, "");
    if (data === null) {
      abort("Incorrect trader settings. Cannot find sell_condition. [%s]->[%s]", object.name(), configFilePath);
    }

    registry.trade.get(objectId).sell_condition = parseConditionsList(data);

    data = readIniString(registry.trade.get(objectId).config, "trader", "buy_supplies", false, "");
    if (data !== null) {
      registry.trade.get(objectId).buy_supplies = parseConditionsList(data);
    }

    // -- buy_item_condition_factor
    data = readIniString(registry.trade.get(objectId).config, "trader", "buy_item_condition_factor", false, "", "0.7");

    if (data !== null) {
      registry.trade.get(objectId).buy_item_condition_factor = parseConditionsList(data);
    }
  }

  /**
   * todo: Description.
   */
  public updateForObject(object: ClientObject): void {
    const tradeDescriptor: Optional<ITradeManagerDescriptor> = registry.trade.get(object.id());

    if (
      tradeDescriptor === null ||
      (tradeDescriptor.update_time !== null && tradeDescriptor.update_time < time_global())
    ) {
      return;
    }

    tradeDescriptor.update_time = time_global() + TradeManager.TRADE_UPDATE_PERIOD;

    const buyCondition = pickSectionFromCondList(registry.actor, object, tradeDescriptor.buy_condition);

    if (buyCondition === "" || buyCondition === null) {
      abort("Wrong section in buy_condition condlist for npc [%s]!", object.name());
    }

    if (tradeDescriptor.current_buy_condition !== buyCondition) {
      object.buy_condition(tradeDescriptor.config, buyCondition);
      tradeDescriptor.current_buy_condition = buyCondition;
    }

    const sellCondition = pickSectionFromCondList(registry.actor, object, tradeDescriptor.sell_condition);

    if (sellCondition === "" || sellCondition === null) {
      abort("Wrong section in buy_condition condlist for npc [%s]!", object.name());
    }

    if (tradeDescriptor.current_sell_condition !== sellCondition) {
      // --'printf("TRADE [%s]: sell condition = %s", npc.name(), str)
      object.sell_condition(tradeDescriptor.config, sellCondition);
      tradeDescriptor.current_sell_condition = sellCondition;
    }

    const buyItemConditionFactor: TRate = tonumber(
      pickSectionFromCondList(registry.actor, object, tradeDescriptor.buy_item_condition_factor)
    )!;

    if (tradeDescriptor.current_buy_item_condition_factor !== buyItemConditionFactor) {
      object.buy_item_condition_factor(buyItemConditionFactor);
      tradeDescriptor.current_buy_item_condition_factor = buyItemConditionFactor;
    }

    if (tradeDescriptor.buy_supplies === null) {
      return;
    }

    const buySupplies = pickSectionFromCondList(registry.actor, object, tradeDescriptor.buy_supplies);

    if (buySupplies === "" || buySupplies === null) {
      abort("Wrong section in buy_condition condlist for npc [%s]!", object.name());
    }

    if (tradeDescriptor.current_buy_supplies !== buySupplies) {
      if (tradeDescriptor.resuply_time !== null && tradeDescriptor.resuply_time < time_global()) {
        return;
      }

      // --'printf("TRADE [%s]: buy_supplies = %s", npc.name(), str)
      object.buy_supplies(tradeDescriptor.config, buySupplies);
      tradeDescriptor.current_buy_supplies = buySupplies;
      tradeDescriptor.resuply_time = time_global() + TradeManager.TRADE_RESUPPLY_PERIOD;
    }
  }

  public getBuyDiscountForObject(objectId: TNumberId): number {
    const tradeDescriptor: ITradeManagerDescriptor = registry.trade.get(objectId);
    const data: string = readIniString(tradeDescriptor.config, "trader", "discounts", false, "", "");

    if (data === "") {
      return 1;
    }

    const section: TSection = pickSectionFromCondList(registry.actor, null, parseConditionsList(data))!;

    return readIniNumber(tradeDescriptor.config, section, "buy", false, 1);
  }

  /**
   * todo: Description.
   */
  public getSellDiscountForObject(objectId: TNumberId): number {
    const tradeManagerDescriptor: ITradeManagerDescriptor = registry.trade.get(objectId);
    const data: string = readIniString(tradeManagerDescriptor.config, "trader", "discounts", false, "", "");

    if (data === "") {
      return 1;
    }

    const section: TSection = pickSectionFromCondList(registry.actor, null, parseConditionsList(data))!;

    return readIniNumber(tradeManagerDescriptor.config, section, "sell", false, 1);
  }

  /**
   * todo: Description.
   */
  public saveObjectState(object: ClientObject, packet: NetPacket): void {
    const tradeDescriptor: ITradeManagerDescriptor = registry.trade.get(object.id());

    openSaveMarker(packet, TradeManager.name);

    if (tradeDescriptor === null) {
      packet.w_bool(false);

      return;
    } else {
      packet.w_bool(true);
    }

    packet.w_stringZ(tradeDescriptor.cfg_ltx);

    if (tradeDescriptor.current_buy_condition === null) {
      packet.w_stringZ("");
    } else {
      packet.w_stringZ(tradeDescriptor.current_buy_condition);
    }

    if (tradeDescriptor.current_sell_condition === null) {
      packet.w_stringZ("");
    } else {
      packet.w_stringZ(tradeDescriptor.current_sell_condition);
    }

    if (tradeDescriptor.current_buy_supplies === null) {
      packet.w_stringZ("");
    } else {
      packet.w_stringZ(tradeDescriptor.current_buy_supplies);
    }

    const now: TTimestamp = time_global();

    if (tradeDescriptor.update_time === null) {
      packet.w_s32(-1);
    } else {
      packet.w_s32(tradeDescriptor.update_time - now);
    }

    if (tradeDescriptor.resuply_time === null) {
      packet.w_s32(-1);
    } else {
      packet.w_s32(tradeDescriptor.resuply_time - now);
    }

    closeSaveMarker(packet, TradeManager.name);
  }

  /**
   * todo: Description.
   */
  public loadObjectState(reader: NetProcessor, object: ClientObject): void {
    openLoadMarker(reader, TradeManager.name);

    const hasTrade: boolean = reader.r_bool();

    if (hasTrade === false) {
      return;
    }

    const tt: ITradeManagerDescriptor = {} as any;

    registry.trade.set(object.id(), tt);

    tt.cfg_ltx = reader.r_stringZ();
    tt.config = new ini_file(tt.cfg_ltx);

    let a = reader.r_stringZ();

    if (a !== "") {
      tt.current_buy_condition = a;
      object.buy_condition(tt.config, a);
    }

    a = reader.r_stringZ();

    if (a !== "") {
      tt.current_sell_condition = a;
      object.sell_condition(tt.config, a);
    }

    a = reader.r_stringZ();

    if (a !== "") {
      tt.current_buy_supplies = a;
    }

    const now: TTimestamp = time_global();
    const updateTime: TTimestamp = reader.r_s32();

    if (updateTime !== -1) {
      tt.update_time = now + updateTime;
    }

    const resuplyTime: TTimestamp = reader.r_s32();

    if (resuplyTime !== -1) {
      tt.resuply_time = now + resuplyTime;
    }

    closeLoadMarker(reader, TradeManager.name);
  }
}
