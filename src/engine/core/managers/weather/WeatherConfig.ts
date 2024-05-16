import { ini_file } from "xray16";

import {
  readAtmosfearConfig,
  readFogDistances,
  readLevelWeathersConfiguration,
} from "@/engine/core/managers/weather/utils/weather_config";
import { readIniSectionAsNumberMap } from "@/engine/core/utils/ini";
import { IniFile, LuaArray, TDistance, TName } from "@/engine/lib/types";

export const DYNAMIC_WEATHER_GRAPHS_LTX: IniFile = new ini_file("environment\\dynamic_weather_graphs.ltx");
export const WEATHER_MANAGER_LTX: IniFile = new ini_file("managers\\weather_manager.ltx");
export const WEATHER_MANAGER_LEVELS_LTX: IniFile = new ini_file("managers\\weather\\weather_manager_levels.ltx");

export const weatherConfig = {
  ATMOSFEAR_CONFIG: readAtmosfearConfig(WEATHER_MANAGER_LTX),
  ATMOSFEAR_LEVEL_CONFIGS: readLevelWeathersConfiguration(WEATHER_MANAGER_LEVELS_LTX),
  // DOF settings based on weather section.
  // Key - section, value - probability.
  DOF_KERNELS: readIniSectionAsNumberMap(DYNAMIC_WEATHER_GRAPHS_LTX, "dof_kernels"),
  // Weather section based fog setting.
  // Defines how far fog should be based on time / weather section.
  FOG_DISTANCES: readFogDistances(DYNAMIC_WEATHER_GRAPHS_LTX),
  DISTANT_STORM_PROBABILITY: 0.5,
  DISTANT_STORM_PARTICLE: "crommcruac\\thunderbolts_distant_00",
  // 24 directions for different hours
  DISTANT_STORM_DIRECTIONS: $fromArray<[TDistance, TDistance]>([
    [-50, 10],
    [30, 90],
    [40, 130],
    [-110, -70],
    [10, 60],
    [-140, -70],
    [-40, 20],
    [90, 160],
    [-190, -140],
    [10, 90],
    [120, 170],
    [-90, -20],
    [30, 130],
    [130, 170],
    [-130, -70],
    [-10, 50],
    [-170, -110],
    [-80, -20],
    [-190, -150],
    [-60, -20],
    [-60, -30],
    [-190, -150],
    [-80, -20],
    [50, 110],
  ]),
  DISTANT_STORM_SOUNDS: $fromArray<TName>([
    "nature\\new_thunder1_hec",
    "nature\\new_thunder2_hec",
    "nature\\new_thunder3_hec",
    "nature\\storm_1",
    "nature\\storm_2",
    "nature\\storm_3",
    "nature\\storm_4",
    "nature\\storm_5",
    "nature\\pre_storm_1",
    "nature\\pre_storm_2",
    "nature\\pre_storm_3",
    "nature\\pre_storm_4",
    "nature\\pre_storm_5",
    "nature\\thunder-3-hec",
    "nature\\thunder-4",
    "nature\\thundernew1",
    "nature\\thundernew2",
    "nature\\thunder-3-hec",
  ]),
  DISTANT_STORM_BOUNDARIES: {
    zaton: $fromArray([
      [0, -600],
      [400, -590],
      [580, -460],
      [800, -390],
      [800, 830],
      [-445, 820],
      [-490, 715],
      [-567, 607],
      [-620, 423],
      [-622, -231],
      [-615, -470],
      [-568, -568],
      [-400, -590],
    ]),
    jupiter: $fromArray([
      [-660, 640],
      [-660, -680],
      [660, -680],
      [660, 640],
    ]),
    pripyat: $fromArray([
      [700, 700],
      [-700, 700],
      [-700, -700],
      [700, -700],
    ]),
  } as Record<TName, LuaArray<[TDistance, TDistance]>>,
  MONTH_DAYS: $fromArray([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
};
