import { Nillable, TDuration, TName, TProbability, TSection } from "@/engine/lib/types";

/**
 * Name of atmosfear weather base.
 *
 * @inline
 */
export const ATMOSFEAR_WEATHER: TName = "atmosfear";

/**
 * Type of active period.
 * Where good weather is clear and shiny, bad - storms, rain, fog.
 */
export const enum EWeatherPeriodType {
  GOOD = "good",
  BAD = "bad",
}

/**
 * Actual weather period.
 */
export const enum EWeatherPeriod {
  CLEAR = "clear",
  CLEAR_FOGGY = "clear_foggy",
  FOGGY = "foggy",
  FOGGY_RAINY = "foggy_rainy",
  RAINY = "rainy",
  PARTLY = "partly",
  STORMY = "stormy",
}

/**
 * Variant of night brightness.
 */
export const enum EWeatherNightBrightness {
  DARK = "dark",
  SLIGHT = "slight",
  MEDIUM = "medium",
  BRIGHT = "bright",
}

/**
 * Period of moons rotation.
 */
export const enum EWeatherMoonPeriod {
  DAYS_28 = "d28",
  DAYS_8 = "d8",
  ALWAYS_0 = "a0",
  ALWAYS_1 = "a1",
  ALWAYS_2 = "a2",
  ALWAYS_3 = "a3",
  ALWAYS_4 = "a4",
  ALWAYS_5 = "a5",
  ALWAYS_6 = "a6",
  ALWAYS_7 = "a7",
}

/**
 * Weather graph defining transitions between weathers.
 */
export type TWeatherGraph = LuaTable<TName, TProbability>;

/**
 * Definition of atmosfear specific configuration.
 */
export interface IAtmosfearConfig {
  moonPhasePeriod: EWeatherMoonPeriod;
  nightBrightness: EWeatherNightBrightness;
}

/**
 * Definition of generic level weather configuration.
 */
export interface IAtmosfearLevelWeatherConfig {
  periodGood: EWeatherPeriod;
  periodGoodLength: TDuration;
  periodBad: EWeatherPeriod;
  periodBadLength: TDuration;
}

/**
 * State of weather manager describing current graph node.
 */
export interface IWeatherState {
  currentState: Nillable<TSection>;
  nextState: Nillable<TSection>;
  weatherName: TName;
  weatherGraph: TWeatherGraph;
}
