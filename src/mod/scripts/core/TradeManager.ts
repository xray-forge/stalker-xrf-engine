// todo: Move to db
import { ini_file, time_global, XR_game_object, XR_net_packet } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, ITradeManagerDescriptor, tradeState } from "@/mod/scripts/core/db";
import { getConfigNumber, getConfigString, parseCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("TradeManager");

export function trade_init(npc: XR_game_object, cfg: string): void {
  log.info("Init trade manager for:", npc.name(), cfg);
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

export function update(npc: XR_game_object): void {
  const tt = tradeState.get(npc.id());

  if (tt === null) {
    return;
  }

  if (tt.update_time !== null && tt.update_time < time_global()) {
    return;
  }

  tt.update_time = time_global() + 3600000;

  let str = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), npc, tt.buy_condition);

  if (str === "" || str === null) {
    abort("Wrong section in buy_condition condlist for npc [%s]!", npc.name());
  }

  if (tt.current_buy_condition !== str) {
    // --'printf("TRADE [%s]: buy condition = %s", npc.name(), str)
    npc.buy_condition(tt.config, str);
    tt.current_buy_condition = str;
  }

  str = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), npc, tt.sell_condition);
  if (str === "" || str === null) {
    abort("Wrong section in buy_condition condlist for npc [%s]!", npc.name());
  }

  if (tt.current_sell_condition !== str) {
    // --'printf("TRADE [%s]: sell condition = %s", npc.name(), str)
    npc.sell_condition(tt.config, str);
    tt.current_sell_condition = str;
  }

  str = tonumber(
    get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), npc, tt.buy_item_condition_factor)
  )!;
  if (tt.current_buy_item_condition_factor !== str) {
    npc.buy_item_condition_factor(str);
    tt.current_buy_item_condition_factor = str;
  }

  if (tt.buy_supplies === null) {
    return;
  }

  str = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), npc, tt.buy_supplies);
  if (str === "" || str === null) {
    abort("Wrong section in buy_condition condlist for npc [%s]!", npc.name());
  }

  if (tt.current_buy_supplies !== str) {
    if (tt.resuply_time !== null && tt.resuply_time < time_global()) {
      return;
    }

    // --'printf("TRADE [%s]: buy_supplies = %s", npc.name(), str)
    npc.buy_supplies(tt.config, str);
    tt.current_buy_supplies = str;
    tt.resuply_time = time_global() + 24 * 3600000;
  }
}

export function save(obj: XR_game_object, packet: XR_net_packet): void {
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

export function load(obj: XR_game_object, packet: XR_net_packet): void {
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

  const sect = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
    getActor(),
    null,
    parseCondList(null, "trade_manager", "discounts", str)
  );

  return getConfigNumber(tt.config, sect, "buy", null, false, 1);
}

export function get_sell_discount(npc_id: number): number {
  const tt: ITradeManagerDescriptor = tradeState.get(npc_id);
  const str = getConfigString(tt.config, "trader", "discounts", null, false, "", "");

  if (str === "") {
    return 1;
  }

  const sect = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
    getActor(),
    null,
    parseCondList(null, "trade_manager", "discounts", str)
  );

  return getConfigNumber(tt.config, sect, "sell", null, false, 1);
}
