import { patrol } from "xray16";

import { ICampPoint, ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { getPatrolFlag, isObjectAtWaypoint } from "@/engine/core/utils/patrol";
import { GameObject, Optional, Patrol } from "@/engine/lib/types";

/**
 * @param object - game object to check
 * @param state - state of camper scheme
 * @returns whether object is on patrol waypoint and waypoint flag mask is matching
 */
export function isOnCampPatrolWalkPoint(object: GameObject, state: ISchemeCamperState): boolean {
  if (state.noRetreat) {
    return false;
  }

  const walkPatrol: Optional<Patrol> = new patrol(state.pathWalk) as Optional<Patrol>;

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
 * todo: Description.
 */
export function getNextCampPatrolPoint(flag: number, state: ISchemeCamperState): Optional<ICampPoint> {
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
