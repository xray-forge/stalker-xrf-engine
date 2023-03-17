import { create_ini_file, ini_file, system_ini, XR_ini_file } from "xray16";

import { Optional } from "@/engine/lib/types";
import { abort } from "@/engine/scripts/utils/debug";

/**
 * Store of dynamically generated LTX files based on content.
 */
export const DYNAMIC_LTX: LuaTable<string, XR_ini_file> = new LuaTable();

/**
 * Create shared registry of dynamic and static LTX.
 * Force initial caching of system LTX/dymmy/etc and add enum to get predefined LTX from registry with some getter.
 * todo;
 * todo;
 * todo;
 */
export const SYSTEM_INI: XR_ini_file = system_ini();
export const DUMMY_LTX: XR_ini_file = new ini_file("scripts\\dummy.ltx");
export const GAME_LTX: XR_ini_file = new ini_file("game.ltx");
export const SIMULATION_LTX: XR_ini_file = new ini_file("misc\\simulation.ltx");
export const SMART_NAMES_LTX: XR_ini_file = new ini_file("misc\\smart_names.ltx");
export const DIALOG_MANAGER_LTX: XR_ini_file = new ini_file("misc\\dialog_manager.ltx");
export const SCRIPT_SOUND_LTX: XR_ini_file = new ini_file("misc\\script_sound.ltx");
export const PH_BOX_GENERIC_LTX: XR_ini_file = new ini_file("misc\\ph_box_generic.ltx");
export const DYNAMIC_WEATHER_GRAPHS: XR_ini_file = new ini_file("environment\\dynamic_weather_graphs.ltx");
export const SECRETS_LTX: XR_ini_file = new ini_file("misc\\secrets.ltx");
export const DEATH_GENERIC_LTX: XR_ini_file = new ini_file("misc\\death_generic.ltx");
export const ITEM_UPGRADES: XR_ini_file = new ini_file("item_upgrades.ltx");
export const STALKER_UPGRADE_INFO: XR_ini_file = new ini_file("misc\\stalkers_upgrade_info.ltx");
export const SURGE_MANAGER_LTX: XR_ini_file = new ini_file("misc\\surge_manager.ltx");
export const SQUAD_BEHAVIOURS_LTX: XR_ini_file = new ini_file("misc\\squad_behaviours.ltx");
export const SMART_TERRAIN_MASKS_LTX: XR_ini_file = new ini_file("misc\\smart_terrain_masks.ltx");
export const TASK_MANAGER_LTX: XR_ini_file = new ini_file("misc\\task_manager.ltx");
export const TRAVEL_MANAGER_LTX: XR_ini_file = new ini_file("misc\\travel_manager.ltx");
export const SIMULATION_OBJECTS_PROPS_LTX: XR_ini_file = new ini_file("misc\\simulation_objects_props.ltx");

/**
 * todo;
 * todo;
 * todo;
 */
export function loadDynamicLtx(name: string, content: Optional<string> = null): LuaMultiReturn<[XR_ini_file, string]> {
  const nameKey: string = "*" + name;
  let dltx: Optional<XR_ini_file> = DYNAMIC_LTX.get(nameKey);

  if (dltx !== null) {
    return $multi(dltx, nameKey);
  } else if (content === null) {
    abort("Unexpected, missing logic with support of null-defined ini files.");
  }

  dltx = create_ini_file(content);
  DYNAMIC_LTX.set(nameKey, dltx);

  return $multi(dltx, nameKey);
}
