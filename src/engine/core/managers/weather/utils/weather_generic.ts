import { FS, getFS, level } from "xray16";

import {
  EWeatherPeriodType,
  IAtmosfearLevelWeatherConfig,
  TWeatherGraph,
} from "@/engine/core/managers/weather/weather_types";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { containsSubstring } from "@/engine/core/utils/string";
import { roots } from "@/engine/lib/constants/roots";
import { LuaArray, Optional, TDuration, TName, TPath, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * Get list all possible weather configs to set.
 * Checks environment configs list and fills list with possible ltx files describing weather cycles.
 *
 * @returns array containing all possible weather names
 */
export function getPossibleWeathersList(): LuaArray<TName> {
  const list: LuaArray<TName> = new LuaTable();
  const fs: FS = getFS();

  if (lfs !== null) {
    const weathersFolder: TPath = fs.update_path(roots.gameConfig, "environment\\weathers");

    const [, directory] = lfs.dir(weathersFolder);
    let directoryItem: Optional<TName> = directory.next();

    while (directoryItem) {
      if (string.sub(directoryItem, -4) === ".ltx") {
        table.insert(list, string.sub(directoryItem, 0, directoryItem.length - 4));
      }

      directoryItem = directory.next();
    }
  }

  return list;
}

/**
 * Get one of possible weathers from change weather graph.
 *
 * @param graph - list of weather-probability pairs to toggle
 * @returns next weather selected from possibilities graph
 */
export function getNextWeatherFromGraph(graph: TWeatherGraph): TName {
  let totalProbability: TRate = 0;

  // todo: Probably store total probability in graph or supply as parameter.
  for (const [, probability] of graph) {
    totalProbability += probability;
  }

  let random: TRate = math.random() * totalProbability;
  let next: Optional<TName> = null;

  // Iterate over possible weathers and try to pick one of them based on their weight.
  for (const [weatherName, weatherProbability] of graph) {
    next = weatherName;
    random -= weatherProbability;

    if (random <= 0) {
      break;
    }
  }

  return next as TName;
}

/**
 * @returns descriptor of level weather periods, defaults for unknown levels
 */
export function getLevelWeatherDescriptor(): IAtmosfearLevelWeatherConfig {
  return (
    weatherConfig.ATMOSFEAR_LEVEL_CONFIGS.get(level.name()) ?? weatherConfig.ATMOSFEAR_LEVEL_CONFIGS.get("default")
  );
}

/**
 * Get next period change hour based on previous change and configuration of level periods.
 * Randomizes change between max period duration and 2/3 of duration.
 *
 * @param period - type of current weather period
 * @param lastPeriodChangedAt - hour of last period change
 * @returns next hour to change period
 */
export function getNextPeriodChangeHour(period: EWeatherPeriodType, lastPeriodChangedAt: TTimestamp): TTimestamp {
  const length: TDuration =
    period === EWeatherPeriodType.GOOD
      ? getLevelWeatherDescriptor().periodGoodLength
      : getLevelWeatherDescriptor().periodBadLength;

  return (lastPeriodChangedAt + 1 + math.random(math.ceil((length * 2) / 3), length)) % 24;
}

/**
 * Check if weather section is indoors.
 *
 * @param weather - section of weather to check
 * @returns whether weather section is indoor
 */
export function isIndoorWeather(weather: TName): boolean {
  return containsSubstring(weather, "indoor");
}

/**
 * Check if weather section is pre-blowout.
 *
 * @param weather - section of weather to check
 * @returns whether weather section is pre-blowout
 */
export function isPreBlowoutWeather(weather: TName): boolean {
  return containsSubstring(weather, "pre_blowout");
}

/**
 * Check if weather section is transition.
 *
 * @param weather - section of weather to check
 * @returns whether weather section is transitioning
 */
export function isTransitionWeather(weather: TName): boolean {
  return containsSubstring(weather, "transition");
}
