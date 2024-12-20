import { ini_file } from "xray16";

import {
  readAtmosfearConfig,
  readFogDistances,
  readLevelWeathersConfiguration,
} from "@/engine/core/managers/weather/utils/weather_config";
import { readIniSectionAsNumberMap } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const DYNAMIC_WEATHER_GRAPHS_LTX: IniFile = new ini_file("environment\\dynamic_weather_graphs.ltx");
export const WEATHER_MANAGER_LTX: IniFile = new ini_file("managers\\weather_manager.ltx");
export const WEATHER_MANAGER_LEVELS_LTX: IniFile = new ini_file("managers\\weather\\weather_manager_levels.ltx");

export const weatherConfig = {
  ATMOSFEAR_CONFIG: readAtmosfearConfig(WEATHER_MANAGER_LTX),
  ATMOSFEAR_LEVEL_CONFIGS: readLevelWeathersConfiguration(WEATHER_MANAGER_LEVELS_LTX),
  // DOF settings based on weather section.
  // Key - section, value - probability.
  DOF_KERNELS: readIniSectionAsNumberMap(DYNAMIC_WEATHER_GRAPHS_LTX, "dof_kernels"),
  DOF_RATE: 1,
  // Weather section based fog setting.
  // Defines how far fog should be based on time / weather section.
  FOG_DISTANCES: readFogDistances(DYNAMIC_WEATHER_GRAPHS_LTX),
  MONTH_DAYS: $fromArray([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
  // Whether current weather is considered underground.
  IS_UNDERGROUND_WEATHER: false,
};
