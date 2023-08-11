import { FS, getFS } from "xray16";

import { containsSubstring } from "@/engine/core/utils/string";
import { roots } from "@/engine/lib/constants/roots";
import { LuaArray, Optional, TName, TPath, TProbability, TRate } from "@/engine/lib/types";

/**
 * Get list all possible weather configs to set.
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
export function getNextWeatherFromGraph(graph: LuaTable<TName, TProbability>): TName {
  let totalProbability: TRate = 0;

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
 * Check if weather section has dynamic base.
 *
 * @param weather - section of weather to check
 * @returns whether weather section is dynamic
 */
export function canUsePeriodsForWeather(weather: TName): boolean {
  return containsSubstring(weather, "dynamic");
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
