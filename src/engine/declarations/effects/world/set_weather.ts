import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TRUE, TStringifiedBoolean } from "xray16/lib";

import { logger } from "./shared";

/**
 * Set current game level weather.
 */
extern(
  "xr_effects.set_weather",
  (_: GameObject, __: GameObject, [weatherName, isForced]: [Nillable<TName>, Nillable<TStringifiedBoolean>]): void => {
    logger.info("Set weather: %s", weatherName);

    if (weatherName) {
      level.set_weather(weatherName, isForced === TRUE);
    }
  }
);
