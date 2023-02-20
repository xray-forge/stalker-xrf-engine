import { ini_file, time_global, XR_game_object, XR_ini_file, XR_net_packet, XR_reader } from "xray16";

import { Optional, TNumberId, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/db";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { getConfigNumber, getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("TradeManager");

export interface ITradeManagerDescriptor {
  cfg_ltx: string;
  config: XR_ini_file;
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
  public static readonly TRADE_UPDATE_PERIOD: number = 3_600_000;
  public static readonly TRADE_RESUPPLY_PERIOD: number = 24 * 3_600_000;

  /**
   * todo
   */
  public initForObject(object: XR_game_object, configFilePath: string): void {
    logger.info("Init trade manager for:", object.name(), configFilePath);

    const objectId: TNumberId = object.id();

    registry.trade.set(objectId, {} as any);
    registry.trade.get(objectId).cfg_ltx = configFilePath;
    registry.trade.get(objectId).config = new ini_file(configFilePath);

    let str = getConfigString(registry.trade.get(objectId).config, "trader", "buy_condition", object, true, "");

    if (str === null) {
      abort("Incorrect trader settings. Cannot find buy_condition. [%s]->[%s]", object.name(), configFilePath);
    }

    registry.trade.get(objectId).buy_condition = parseCondList(object, "trade_manager", "buy_condition", str);

    str = getConfigString(registry.trade.get(objectId).config, "trader", "sell_condition", object, true, "");
    if (str === null) {
      abort("Incorrect trader settings. Cannot find sell_condition. [%s]->[%s]", object.name(), configFilePath);
    }

    registry.trade.get(objectId).sell_condition = parseCondList(object, "trade_manager", "sell_condition", str);

    str = getConfigString(registry.trade.get(objectId).config, "trader", "buy_supplies", object, false, "");
    if (str !== null) {
      registry.trade.get(objectId).buy_supplies = parseCondList(object, "trade_manager", "buy_supplies", str);
    }

    // -- buy_item_condition_factor
    str = getConfigString(
      registry.trade.get(objectId).config,
      "trader",
      "buy_item_condition_factor",
      object,
      false,
      "",
      "0.7"
    );
    if (str !== null) {
      registry.trade.get(objectId).buy_item_condition_factor = parseCondList(
        object,
        "trade_manager",
        "buy_item_condition_factor",
        str
      );
    }
  }

  /**
   * todo;
   */
  public updateForObject(object: XR_game_object): void {
    const tradeDescriptor: Optional<ITradeManagerDescriptor> = registry.trade.get(object.id());

    if (
      tradeDescriptor === null ||
      (tradeDescriptor.update_time !== null && tradeDescriptor.update_time < time_global())
    ) {
      return;
    }

    tradeDescriptor.update_time = time_global() + TradeManager.TRADE_UPDATE_PERIOD;

    const buy_condition = pickSectionFromCondList(registry.actor, object, tradeDescriptor.buy_condition);

    if (buy_condition === "" || buy_condition === null) {
      abort("Wrong section in buy_condition condlist for npc [%s]!", object.name());
    }

    if (tradeDescriptor.current_buy_condition !== buy_condition) {
      object.buy_condition(tradeDescriptor.config, buy_condition);
      tradeDescriptor.current_buy_condition = buy_condition;
    }

    const sell_condition = pickSectionFromCondList(registry.actor, object, tradeDescriptor.sell_condition);

    if (sell_condition === "" || sell_condition === null) {
      abort("Wrong section in buy_condition condlist for npc [%s]!", object.name());
    }

    if (tradeDescriptor.current_sell_condition !== sell_condition) {
      // --'printf("TRADE [%s]: sell condition = %s", npc.name(), str)
      object.sell_condition(tradeDescriptor.config, sell_condition);
      tradeDescriptor.current_sell_condition = sell_condition;
    }

    const buy_item_condition_factor = tonumber(
      pickSectionFromCondList(registry.actor, object, tradeDescriptor.buy_item_condition_factor)
    )!;

    if (tradeDescriptor.current_buy_item_condition_factor !== buy_item_condition_factor) {
      object.buy_item_condition_factor(buy_item_condition_factor);
      tradeDescriptor.current_buy_item_condition_factor = buy_item_condition_factor;
    }

    if (tradeDescriptor.buy_supplies === null) {
      return;
    }

    const buy_supplies = pickSectionFromCondList(registry.actor, object, tradeDescriptor.buy_supplies);

    if (buy_supplies === "" || buy_supplies === null) {
      abort("Wrong section in buy_condition condlist for npc [%s]!", object.name());
    }

    if (tradeDescriptor.current_buy_supplies !== buy_supplies) {
      if (tradeDescriptor.resuply_time !== null && tradeDescriptor.resuply_time < time_global()) {
        return;
      }

      // --'printf("TRADE [%s]: buy_supplies = %s", npc.name(), str)
      object.buy_supplies(tradeDescriptor.config, buy_supplies);
      tradeDescriptor.current_buy_supplies = buy_supplies;
      tradeDescriptor.resuply_time = time_global() + TradeManager.TRADE_RESUPPLY_PERIOD;
    }
  }

  public getBuyDiscountForObject(objectId: TNumberId): number {
    const tradeDescriptor: ITradeManagerDescriptor = registry.trade.get(objectId);
    const str: string = getConfigString(tradeDescriptor.config, "trader", "discounts", null, false, "", "");

    if (str === "") {
      return 1;
    }

    const sect: TSection = pickSectionFromCondList(
      registry.actor,
      null,
      parseCondList(null, "trade_manager", "discounts", str)
    )!;

    return getConfigNumber(tradeDescriptor.config, sect, "buy", null, false, 1);
  }

  /**
   * todo;
   */
  public getSellDiscountForObject(objectId: TNumberId): number {
    const tt: ITradeManagerDescriptor = registry.trade.get(objectId);
    const str = getConfigString(tt.config, "trader", "discounts", null, false, "", "");

    if (str === "") {
      return 1;
    }

    const sect: TSection = pickSectionFromCondList(
      registry.actor,
      null,
      parseCondList(null, "trade_manager", "discounts", str)
    )!;

    return getConfigNumber(tt.config, sect, "sell", null, false, 1);
  }

  /**
   * todo;
   */
  public saveObjectState(object: XR_game_object, packet: XR_net_packet): void {
    const tradeDescriptor: ITradeManagerDescriptor = registry.trade.get(object.id());

    setSaveMarker(packet, false, TradeManager.name);

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

    const cur_tm = time_global();

    if (tradeDescriptor.update_time === null) {
      packet.w_s32(-1);
    } else {
      packet.w_s32(tradeDescriptor.update_time - cur_tm);
    }

    if (tradeDescriptor.resuply_time === null) {
      packet.w_s32(-1);
    } else {
      packet.w_s32(tradeDescriptor.resuply_time - cur_tm);
    }

    setSaveMarker(packet, true, TradeManager.name);
  }

  /**
   * todo;
   */
  public loadObjectState(object: XR_game_object, packet: XR_reader): void {
    setLoadMarker(packet, false, TradeManager.name);

    const hasTrade = packet.r_bool();

    if (hasTrade === false) {
      return;
    }

    const tt: ITradeManagerDescriptor = {} as any;

    registry.trade.set(object.id(), tt);

    tt.cfg_ltx = packet.r_stringZ();
    tt.config = new ini_file(tt.cfg_ltx);

    let a = packet.r_stringZ();

    if (a !== "") {
      tt.current_buy_condition = a;
      object.buy_condition(tt.config, a);
    }

    a = packet.r_stringZ();

    if (a !== "") {
      tt.current_sell_condition = a;
      object.sell_condition(tt.config, a);
    }

    a = packet.r_stringZ();

    if (a !== "") {
      tt.current_buy_supplies = a;
    }

    const cur_tm = time_global();

    const updTime: number = packet.r_s32();

    if (updTime !== -1) {
      tt.update_time = cur_tm + updTime;
    }

    const resuplyTime: number = packet.r_s32();

    if (resuplyTime !== -1) {
      tt.resuply_time = cur_tm + resuplyTime;
    }

    setLoadMarker(packet, true, TradeManager.name);
  }
}
