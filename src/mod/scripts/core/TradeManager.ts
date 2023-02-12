// todo: Move to db
import { ini_file, time_global, XR_game_object, XR_net_packet, XR_reader } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/configuration";
import { getActor, ITradeManagerDescriptor, tradeState } from "@/mod/scripts/core/db";
import { getConfigNumber, getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("TradeManager");

export function trade_init(npc: XR_game_object, cfg: string): void {
  logger.info("Init trade manager for:", npc.name(), cfg);
  // --'    printf("TRADE INIT[%s]", npc.name())
  // --'    if (trade_manager.get(npc.id())] === null ) {
  tradeState.set(npc.id(), {} as any);
  // --'    }

  tradeState.get(npc.id()).cfg_ltx = cfg;
  tradeState.get(npc.id()).config = new ini_file(cfg);

  let str = getConfigString(tradeState.get(npc.id()).config, "trader", "buy_condition", npc, true, "");

  if (str === null) {
    abort("Incorrect trader settings. Cannot find buy_condition. [%s]->[%s]", npc.name(), cfg);
  }

  tradeState.get(npc.id()).buy_condition = parseCondList(npc, "trade_manager", "buy_condition", str);

  // -- ����������� �������
  str = getConfigString(tradeState.get(npc.id()).config, "trader", "sell_condition", npc, true, "");
  if (str === null) {
    abort("Incorrect trader settings. Cannot find sell_condition. [%s]->[%s]", npc.name(), cfg);
  }

  tradeState.get(npc.id()).sell_condition = parseCondList(npc, "trade_manager", "sell_condition", str);

  // -- ������ �������
  str = getConfigString(tradeState.get(npc.id()).config, "trader", "buy_supplies", npc, false, "");
  if (str !== null) {
    tradeState.get(npc.id()).buy_supplies = parseCondList(npc, "trade_manager", "buy_supplies", str);
  }

  // -- buy_item_condition_factor
  str = getConfigString(tradeState.get(npc.id()).config, "trader", "buy_item_condition_factor", npc, false, "", "0.7");
  if (str !== null) {
    tradeState.get(npc.id()).buy_item_condition_factor = parseCondList(
      npc,
      "trade_manager",
      "buy_item_condition_factor",
      str
    );
  }
}

export function updateTradeManager(npc: XR_game_object): void {
  const tt = tradeState.get(npc.id());

  if (tt === null) {
    return;
  }

  if (tt.update_time !== null && tt.update_time < time_global()) {
    return;
  }

  tt.update_time = time_global() + 3600000;

  const buy_condition = pickSectionFromCondList(getActor(), npc, tt.buy_condition);

  if (buy_condition === "" || buy_condition === null) {
    abort("Wrong section in buy_condition condlist for npc [%s]!", npc.name());
  }

  if (tt.current_buy_condition !== buy_condition) {
    npc.buy_condition(tt.config, buy_condition);
    tt.current_buy_condition = buy_condition;
  }

  const sell_condition = pickSectionFromCondList(getActor(), npc, tt.sell_condition);

  if (sell_condition === "" || sell_condition === null) {
    abort("Wrong section in buy_condition condlist for npc [%s]!", npc.name());
  }

  if (tt.current_sell_condition !== sell_condition) {
    // --'printf("TRADE [%s]: sell condition = %s", npc.name(), str)
    npc.sell_condition(tt.config, sell_condition);
    tt.current_sell_condition = sell_condition;
  }

  const buy_item_condition_factor = tonumber(pickSectionFromCondList(getActor(), npc, tt.buy_item_condition_factor))!;

  if (tt.current_buy_item_condition_factor !== buy_item_condition_factor) {
    npc.buy_item_condition_factor(buy_item_condition_factor);
    tt.current_buy_item_condition_factor = buy_item_condition_factor;
  }

  if (tt.buy_supplies === null) {
    return;
  }

  const buy_supplies = pickSectionFromCondList(getActor(), npc, tt.buy_supplies);

  if (buy_supplies === "" || buy_supplies === null) {
    abort("Wrong section in buy_condition condlist for npc [%s]!", npc.name());
  }

  if (tt.current_buy_supplies !== buy_supplies) {
    if (tt.resuply_time !== null && tt.resuply_time < time_global()) {
      return;
    }

    // --'printf("TRADE [%s]: buy_supplies = %s", npc.name(), str)
    npc.buy_supplies(tt.config, buy_supplies);
    tt.current_buy_supplies = buy_supplies;
    tt.resuply_time = time_global() + 24 * 3600_000;
  }
}

export function saveTradeManager(obj: XR_game_object, packet: XR_net_packet): void {
  const tt: ITradeManagerDescriptor = tradeState.get(obj.id());

  setSaveMarker(packet, false, "trade_manager");

  if (tt === null) {
    packet.w_bool(false);

    return;
  } else {
    packet.w_bool(true);
  }

  packet.w_stringZ(tt.cfg_ltx);

  if (tt.current_buy_condition === null) {
    packet.w_stringZ("");
  } else {
    packet.w_stringZ(tt.current_buy_condition);
  }

  if (tt.current_sell_condition === null) {
    packet.w_stringZ("");
  } else {
    packet.w_stringZ(tt.current_sell_condition);
  }

  if (tt.current_buy_supplies === null) {
    packet.w_stringZ("");
  } else {
    packet.w_stringZ(tt.current_buy_supplies);
  }

  const cur_tm = time_global();

  if (tt.update_time === null) {
    packet.w_s32(-1);
  } else {
    packet.w_s32(tt.update_time - cur_tm);
  }

  if (tt.resuply_time === null) {
    packet.w_s32(-1);
  } else {
    packet.w_s32(tt.resuply_time - cur_tm);
  }

  setSaveMarker(packet, true, "trade_manager");
}

export function loadTradeManager(obj: XR_game_object, packet: XR_reader): void {
  setLoadMarker(packet, false, "trade_manager");

  const hasTrade = packet.r_bool();

  if (hasTrade === false) {
    return;
  }

  const tt: ITradeManagerDescriptor = {} as any;

  tradeState.set(obj.id(), tt);

  tt.cfg_ltx = packet.r_stringZ();
  tt.config = new ini_file(tt.cfg_ltx);

  let a = packet.r_stringZ();

  if (a !== "") {
    tt.current_buy_condition = a;
    obj.buy_condition(tt.config, a);
  }

  a = packet.r_stringZ();

  if (a !== "") {
    tt.current_sell_condition = a;
    obj.sell_condition(tt.config, a);
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

  setLoadMarker(packet, true, "trade_manager");
}

export function get_buy_discount(npc_id: number): number {
  const tt: ITradeManagerDescriptor = tradeState.get(npc_id);
  const str: string = getConfigString(tt.config, "trader", "discounts", null, false, "", "");

  if (str === "") {
    return 1;
  }

  const sect: TSection = pickSectionFromCondList(
    getActor(),
    null,
    parseCondList(null, "trade_manager", "discounts", str)
  )!;

  return getConfigNumber(tt.config, sect, "buy", null, false, 1);
}

export function get_sell_discount(npc_id: number): number {
  const tt: ITradeManagerDescriptor = tradeState.get(npc_id);
  const str = getConfigString(tt.config, "trader", "discounts", null, false, "", "");

  if (str === "") {
    return 1;
  }

  const sect: TSection = pickSectionFromCondList(
    getActor(),
    null,
    parseCondList(null, "trade_manager", "discounts", str)
  )!;

  return getConfigNumber(tt.config, sect, "sell", null, false, 1);
}
