import { ini_file, system_ini } from "xray16";

import { IniFile, TLabel } from "@/engine/lib/types";

/**
 * Prefix to mark ini files stored in RAM.
 */
export const DYNAMIC_LTX_PREFIX: TLabel = "*";

export const SYSTEM_INI: IniFile = system_ini();

export const DUMMY_LTX: IniFile = new ini_file("scripts\\dummy.ltx");
export const DYNAMIC_WEATHER_GRAPHS: IniFile = new ini_file("environment\\dynamic_weather_graphs.ltx");
export const GAME_LTX: IniFile = new ini_file("game.ltx");
export const PH_BOX_GENERIC_LTX: IniFile = new ini_file("misc\\ph_box_generic.ltx");
export const SMART_TERRAIN_MASKS_LTX: IniFile = new ini_file("misc\\smart_terrain_masks.ltx");
export const SOUND_STORIES_LTX: IniFile = new ini_file("misc\\sound_stories.ltx");
export const SQUAD_BEHAVIOURS_LTX: IniFile = new ini_file("misc\\squad_behaviours.ltx");
