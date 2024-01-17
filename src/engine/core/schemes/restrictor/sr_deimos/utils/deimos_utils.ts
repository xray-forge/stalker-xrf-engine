import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos";
import { EScheme, GameObject, TName, TRate } from "@/engine/lib/types";

/**
 *
 * @param object - restrictor object to check phase for
 * @param bounds - type of deimos phase bounds
 * @param isIncreasing - whether deimos phase direction is increasing or decreasing
 * @returns whether deimos phase is active in restrictor game object
 */
export function isDeimosPhaseActive(object: GameObject, bounds: TName, isIncreasing: boolean): boolean {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  // Deimos is not activated, phase is disabled.
  if (state.activeScheme !== EScheme.SR_DEIMOS) {
    return false;
  }

  const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;

  // todo: Probably should be separate rate for increase and decrease variants.
  const intensityDelta: TRate =
    deimosState.growingRate * (deimosState.movementSpeed - registry.actor.get_movement_speed().magnitude()) * 0.005;

  // Skip invalid cases, assumptions for deimos increasing phase are:
  // Increase -> actor speed is faster than deimos and deimos is decreasing.
  // Decrease -> actor speed is slower than deimos and deimos is growing.
  if ((isIncreasing && intensityDelta < 0) || (!isIncreasing && intensityDelta >= 0)) {
    return false;
  }

  // todo: Enumeration?
  switch (bounds) {
    case "disable_bound":
      return isIncreasing
        ? deimosState.intensity > deimosState.disableBound
        : deimosState.intensity < deimosState.disableBound;

    case "lower_bound":
      return isIncreasing
        ? deimosState.intensity > deimosState.switchLowerBound
        : deimosState.intensity < deimosState.switchLowerBound;

    case "upper_bound":
      return isIncreasing
        ? deimosState.intensity > deimosState.switchUpperBound
        : deimosState.intensity < deimosState.switchUpperBound;
  }

  return false;
}
