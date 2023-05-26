import { ini_file, system_ini } from "xray16";

import { TLabel } from "@/engine/lib/types";

/**
 * Prefix to mark ini files stored in RAM.
 */
export const DYNAMIC_LTX_PREFIX: TLabel = "*";

export const SYSTEM_INI: ini_file = system_ini();
export const DUMMY_LTX: ini_file = new ini_file("scripts\\dummy.ltx");
export const GAME_LTX: ini_file = new ini_file("game.ltx");
export const SIMULATION_LTX: ini_file = new ini_file("misc\\simulation.ltx");
export const DIALOG_MANAGER_LTX: ini_file = new ini_file("misc\\dialog_manager.ltx");
export const SCRIPT_SOUND_LTX: ini_file = new ini_file("misc\\script_sound.ltx");
export const PH_BOX_GENERIC_LTX: ini_file = new ini_file("misc\\ph_box_generic.ltx");
export const DYNAMIC_WEATHER_GRAPHS: ini_file = new ini_file("environment\\dynamic_weather_graphs.ltx");
export const SECRETS_LTX: ini_file = new ini_file("misc\\secrets.ltx");
export const DEATH_GENERIC_LTX: ini_file = new ini_file("misc\\death_generic.ltx");
export const ITEM_UPGRADES: ini_file = new ini_file("item_upgrades.ltx");
export const STALKER_UPGRADE_INFO: ini_file = new ini_file("misc\\stalkers_upgrade_info.ltx");
export const SURGE_MANAGER_LTX: ini_file = new ini_file("misc\\surge_manager.ltx");
export const SQUAD_BEHAVIOURS_LTX: ini_file = new ini_file("misc\\squad_behaviours.ltx");
export const SMART_TERRAIN_MASKS_LTX: ini_file = new ini_file("misc\\smart_terrain_masks.ltx");
export const TASK_MANAGER_LTX: ini_file = new ini_file("misc\\task_manager.ltx");
export const TRAVEL_MANAGER_LTX: ini_file = new ini_file("misc\\travel_manager.ltx");
export const SIMULATION_OBJECTS_PROPS_LTX: ini_file = new ini_file("misc\\simulation_objects_props.ltx");
export const SOUND_STORIES_LTX: ini_file = new ini_file("misc\\sound_stories.ltx");
