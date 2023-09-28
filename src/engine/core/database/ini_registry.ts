import { ini_file, system_ini } from "xray16";

import { IniFile, TLabel } from "@/engine/lib/types";

/**
 * Prefix to mark ini files stored in RAM.
 */
export const DYNAMIC_LTX_PREFIX: TLabel = "*";

export const SYSTEM_INI: IniFile = system_ini();

export const DEATH_GENERIC_LTX: IniFile = new ini_file("misc\\death_generic.ltx");
export const DIALOG_MANAGER_LTX: IniFile = new ini_file("misc\\dialog_manager.ltx");
export const DUMMY_LTX: IniFile = new ini_file("scripts\\dummy.ltx");
export const DYNAMIC_WEATHER_GRAPHS: IniFile = new ini_file("environment\\dynamic_weather_graphs.ltx");
export const GAME_LTX: IniFile = new ini_file("game.ltx");
export const ITEM_UPGRADES: IniFile = new ini_file("item_upgrades.ltx");
export const PH_BOX_GENERIC_LTX: IniFile = new ini_file("misc\\ph_box_generic.ltx");
export const SCRIPT_SOUND_LTX: IniFile = new ini_file("misc\\script_sound.ltx");
export const SIMULATION_LTX: IniFile = new ini_file("misc\\simulation.ltx");
export const SIMULATION_OBJECTS_PROPS_LTX: IniFile = new ini_file("misc\\simulation_objects_props.ltx");
export const SMART_TERRAIN_MASKS_LTX: IniFile = new ini_file("misc\\smart_terrain_masks.ltx");
export const SOUND_STORIES_LTX: IniFile = new ini_file("misc\\sound_stories.ltx");
export const SQUAD_BEHAVIOURS_LTX: IniFile = new ini_file("misc\\squad_behaviours.ltx");
export const STALKER_UPGRADE_INFO: IniFile = new ini_file("misc\\stalkers_upgrade_info.ltx");
