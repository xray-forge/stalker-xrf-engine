import { GameObject } from "xray16/alias";
import { Nillable, TDistance, TDuration, TRate } from "xray16/lib";

import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";

/**
 * Calculate the visibility value contributed by one visual-memory update.
 *
 * OpenXRay accumulates this value for a target and marks it visible after it reaches the observer's configured
 * `visibility_threshold`. The engine invokes this callback only after handling the always-visible range.
 *
 * @param object - Object evaluating visibility, or null when the engine has no script object for the observer.
 * @param target - Object being evaluated, or null when the engine has no script object for the target.
 * @param timeDelta - Elapsed time since the target's previous visibility update.
 * @param timeQuantity - Configured time quantum used to normalize the visibility contribution.
 * @param luminosity - Normalized luminosity of the target.
 * @param velocityFactor - Configured multiplier applied to the target's velocity.
 * @param velocity - Target velocity calculated by the visual-memory manager.
 * @param distance - Visibility range calculated from the observer's range and field of view.
 * @param objectDistance - Actual distance from the observer to the target.
 * @param alwaysVisibleDistance - Engine threshold handled before this callback; retained for the engine callback contract.
 * @returns Visibility value to accumulate for this update.
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
  luminosity = luminosity <= 0 ? 0.0001 : luminosity;
  distance = distance <= 0 ? 0.00001 : distance;

  if (weatherConfig.IS_UNDERGROUND_WEATHER) {
    luminosity += 0.35;
  }

  // CoC visual-memory callback override. The engine handles always-visible targets before invoking this function.
  // time_delta / time_quant * luminosity * (1 + velocity_factor * velocity) * (distance - object_distance) / distance

  return (
    ((timeDelta / timeQuantity) * luminosity * (1 + velocityFactor * velocity) * (distance - objectDistance)) / distance
  );
}
