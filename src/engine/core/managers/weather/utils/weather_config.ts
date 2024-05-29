import { ini_file } from "xray16";

import {
  EWeatherMoonPeriod,
  EWeatherNightBrightness,
  EWeatherPeriod,
  IAtmosfearConfig,
  IAtmosfearLevelWeatherConfig,
} from "@/engine/core/managers/weather/weather_types";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { hoursToWeatherPeriod } from "@/engine/core/utils/time";
import { IniFile, TCount, TDistance, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @param ini - ini file to read atmosfear configuration from
 * @returns global level configuration for atmosfear
 */
export function readAtmosfearConfig(ini: IniFile): IAtmosfearConfig {
  return {
    moonPhasePeriod: readIniString(
      ini,
      "atmosfear_default_parameters",
      "moon_phase_period",
      false,
      null,
      EWeatherMoonPeriod.DAYS_8
    ),
    nightBrightness: readIniString(
      ini,
      "atmosfear_default_parameters",
      "night_brightness",
      false,
      null,
      EWeatherNightBrightness.SLIGHT
    ),
  };
}

/**
 * Read fog distance based on current weather cycles/periods.
 *
 * @param ini - target ini to read fog distances from
 * @returns object defining weather fog distance based on active cycle and daytime
 */
export function readFogDistances(ini: IniFile): LuaTable<TSection, LuaTable<TSection, TDistance>> {
  const distances: LuaTable<TSection, LuaTable<TSection, TDistance>> = new LuaTable();
  const count: TCount = ini.line_count("dof_kernels");

  for (const index of $range(0, count - 1)) {
    const [, cycle] = ini.r_line("dof_kernels", index, "", "");

    const weatherCycle: LuaTable<TSection, TDistance> = new LuaTable();
    const weatherCycleLtx: IniFile = new ini_file(
      `environment\\weathers\\af3_dark_${cycle}${
        cycle === EWeatherPeriod.CLEAR || cycle === EWeatherPeriod.PARTLY ? "_0" : ""
      }.ltx`
    );

    for (const index of $range(0, 23)) {
      const timePeriod: TSection = hoursToWeatherPeriod(index);

      weatherCycle.set(timePeriod, readIniNumber(weatherCycleLtx, timePeriod, "fog_distance", false, 500));
    }

    distances.set(cycle, weatherCycle);
  }

  logger.info("Read fog distances for %s cycles", count);

  return distances;
}

/**
 * Read configuration of level weathers.
 * Defines periods and durations of weather for specific levels.
 *
 * @param ini - file to read data from or fallback to defaults
 * @returns configuration of weather for levels
 */
export function readLevelWeathersConfiguration(ini: IniFile): LuaTable<TName, IAtmosfearLevelWeatherConfig> {
  const list: LuaTable<TName, IAtmosfearLevelWeatherConfig> = new LuaTable();

  list.set("default", {
    periodBad: EWeatherPeriod.FOGGY_RAINY,
    periodBadLength: 6,
    periodGood: EWeatherPeriod.CLEAR_FOGGY,
    periodGoodLength: 6,
  });

  ini.section_for_each((level: TName): void => {
    list.set(level, {
      periodGood: readIniString(ini, level, "period_good", false, null, EWeatherPeriod.CLEAR_FOGGY),
      periodGoodLength: readIniNumber(ini, level, "period_good_length", false, 6),
      periodBad: readIniString(ini, level, "period_bad", false, null, EWeatherPeriod.FOGGY_RAINY),
      periodBadLength: readIniNumber(ini, level, "period_bad_length", false, 6),
    });
  });

  return list;
}
