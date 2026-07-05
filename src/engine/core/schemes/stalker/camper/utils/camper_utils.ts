import { patrol } from "xray16";
import { GameObject, Patrol } from "xray16/alias";

import { ICampPoint, ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { getPatrolFlag, isObjectAtWaypoint } from "@/engine/core/utils/patrol";
import { Nillable } from "@/engine/lib/types";

/**
 * @param object - Game object to check.
 * @param state - State of camper scheme.
 * @returns Whether object is on patrol waypoint and waypoint flag mask is matching.
 */
export function isOnCampPatrolWalkPoint(object: GameObject, state: ISchemeCamperState): boolean {
  if (state.noRetreat) {
    return false;
  }

  const walkPatrol: Nillable<Patrol> = new patrol(state.pathWalk) as Nillable<Patrol>;

  if (!walkPatrol) {
    return false;
  }

  for (const index of $range(0, walkPatrol.count() - 1)) {
    if (isObjectAtWaypoint(object, walkPatrol, index)) {
      state.waypointFlag = getPatrolFlag(walkPatrol, index);

      return state.waypointFlag !== null;
    }
  }

  state.waypointFlag = null;

  return false;
}

/**
 * Get the next camp look point to scan toward for the given waypoint flag, cycling through the scan table.
 *
 * @param flag - The waypoint flag whose scan points are iterated.
 * @param state - State of camper scheme.
 * @returns The next camp point to look at, or null when none are available.
 */
export function getNextCampPatrolPoint(flag: number, state: ISchemeCamperState): Nillable<ICampPoint> {
  let isNext: boolean = false;

  if (!state.lastLookPoint) {
    table.sort(state.scanTable!.get(flag), (first, second) => {
      return first.key < second.key;
    });
  }

  for (const [, campPoint] of state.scanTable!.get(flag)) {
    if (!state.lastLookPoint) {
      return campPoint;
    }

    if (isNext) {
      return campPoint;
    }

    if (state.lastLookPoint.key === campPoint.key) {
      isNext = true;
    }
  }

  if (isNext) {
    if (state.lastLookPoint!.key === 0) {
      table.sort(state.scanTable!.get(flag), (first, second) => first.key < second.key);
    } else {
      table.sort(state.scanTable!.get(flag), (first, second) => first.key > second.key);
    }
  }

  return state.lastLookPoint!;
}
