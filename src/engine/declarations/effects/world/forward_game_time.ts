import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Forward the in-game clock by the provided hours and minutes and force a weather change.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param hoursString - Number of hours to advance the game time by.
 * @param minutesString - Number of minutes to advance the game time by.
 */
extern(
  "xr_effects.forward_game_time",
  (_: GameObject, __: GameObject, [hoursString, minutesString]: [string, string]): void => {
    logger.info("Forward game time");

    const hours: number = tonumber(hoursString)!;
    const minutes: number = tonumber(minutesString) ?? 0;

    level.change_game_time(0, hours, minutes);
    getManager(WeatherManager).forceWeatherChange();
    surgeConfig.IS_TIME_FORWARDED = true;
  }
);
