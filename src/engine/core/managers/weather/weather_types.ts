import {
  Optional,
  ParticlesObject,
  SoundObject,
  TDuration,
  TName,
  TProbability,
  TSection,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * Name of atmosfear weather base.
 */
export const ATMOSFEAR_WEATHER: TName = "atmosfear";

/**
 * Type of active period.
 * Where good weather is clear and shiny, bad - storms, rain, fog.
 */
export enum EWeatherPeriodType {
  GOOD = "good",
  BAD = "bad",
}

/**
 * Actual weather period.
 */
export enum EWeatherPeriod {
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
export enum EWeatherNightBrightness {
  DARK = "dark",
  SLIGHT = "slight",
  MEDIUM = "medium",
  BRIGHT = "bright",
}

/**
 * Period of moons rotation.
 */
export enum EWeatherMoonPeriod {
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
 * Descriptor of active thunder effect + sounds.
 * Used for distant storms before actual rainy/stormy weathers.
 */
export interface IThunderDescriptor {
  createdAt: TTimestamp;
  effect: ParticlesObject;
  isHit: boolean;
  particlePosition: Vector;
  sound: SoundObject;
  soundPosition: Vector;
}

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
  currentState: Optional<TSection>;
  nextState: Optional<TSection>;
  weatherName: TName;
  weatherGraph: TWeatherGraph;
}
