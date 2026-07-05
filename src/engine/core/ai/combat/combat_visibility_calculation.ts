import { GameObject } from "xray16/alias";
import { Nillable, TDistance, TDuration, TRate } from "xray16/lib";

import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";

/**
 * If value >= visiblity_threshold then object is considered visible.
 * `visibility_threshold` is configured in LTX files for each monster / stalker separately.
 *
 * @param object - Target object checking visibility.
 * @param target - Target checking visibility for from perspective of object.
 * @param timeDelta - ?.
 * @param timeQuantity - ?.
 * @param luminosity - Level of brightness outside.
 * @param velocityFactor - ?.
 * @param velocity - ?.
 * @param distance - ?.
 * @param objectDistance - ?.
 * @param alwaysVisibleDistance - ?.
 * @returns Visibility rate.
 */
export function calculateObjectVisibility(
  object: Nillable<GameObject>,
  target: Nillable<GameObject>,
  timeDelta: TDuration,
  timeQuantity: TDuration,
  luminosity: TRate,
  velocityFactor: TRate,
  velocity: TRate,
  distance: TDistance,
  objectDistance: TDistance,
  alwaysVisibleDistance: TDistance
): TRate {
  luminosity = luminosity <= 0 ? 0.00001 : luminosity;
  distance = distance <= 0 ? 0.00001 : distance;

  if (weatherConfig.IS_UNDERGROUND_WEATHER) {
    luminosity *= 0.35;
  }

  // Unaltered formula from engine:
  // time_delta / time_quant * luminocity * (1 + velocity_factor*velocity) * (distance - object_distance) /
  //   (distance - always_visible_distance)

  return (
    ((timeDelta / timeQuantity) * luminosity * (1 + velocityFactor * velocity) * (distance - objectDistance)) / distance
  );
}
