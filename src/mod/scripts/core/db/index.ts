import { XR_CZoneCampfire, XR_ini_file } from "xray16";

import type { IAnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import type { CampStoryManager } from "@/mod/scripts/core/schemes/base/CampStoryManager";
import type { CampPatrolManager } from "@/mod/scripts/core/schemes/kamp/SchemeCamp";
import type { PatrolManager } from "@/mod/scripts/core/schemes/patrol/SchemePatrol";
import type { ReachTaskPatrolManager } from "@/mod/scripts/core/schemes/reach_task/ReachTaskPatrolManager";
import type { SchemeLight } from "@/mod/scripts/core/schemes/sr_light/SchemeLight";
import type { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";

export * from "@/mod/scripts/core/db/registry";
export * from "@/mod/scripts/core/db/objects";
export * from "@/mod/scripts/core/db/doors";
export * from "@/mod/scripts/core/db/actor";
export * from "@/mod/scripts/core/db/helicopter";
export * from "@/mod/scripts/core/db/anomaly";
export * from "@/mod/scripts/core/db/zones";
export * from "@/mod/scripts/core/db/smart_terrains";

// todo: Move game volume to db.

export const goodwill = { sympathy: new LuaTable(), relations: new LuaTable() };
export const offlineObjects: LuaTable<number, any> = new LuaTable();
export const REGISTERED_ITEMS: LuaTable<string, number> = new LuaTable();
export const tradeState: LuaTable<number, ITradeManagerDescriptor> = new LuaTable();

export const reactTaskPatrols: LuaTable<string, ReachTaskPatrolManager> = new LuaTable();
export const patrols: LuaTable<number, PatrolManager> = new LuaTable();
export const kamps: LuaTable<string, CampPatrolManager> = new LuaTable(); // Camp patrols.
export const kamp_stalkers: LuaTable<number, boolean> = new LuaTable();
export const CAMPS: LuaTable<number, CampStoryManager> = new LuaTable(); // Camp stories.
export const campfire_table: LuaTable<string, XR_CZoneCampfire> = new LuaTable();

// todo: Move to db.
export const ARTEFACT_WAYS_BY_ARTEFACT_ID: LuaTable<number, string> = new LuaTable();
// todo: Move to db.
export const ARTEFACT_POINTS_BY_ARTEFACT_ID: LuaTable<number, number> = new LuaTable();
/**
 * todo: Move to DB.
 * Ownership of artefacts linking.
 */
export const PARENT_ZONES_BY_ARTEFACT_ID: LuaTable<number, IAnomalyZoneBinder> = new LuaTable();

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

export const sound_themes: LuaTable<string, AbstractPlayableSound> = new LuaTable();
export const light_zones: LuaTable<number, SchemeLight> = new LuaTable();
