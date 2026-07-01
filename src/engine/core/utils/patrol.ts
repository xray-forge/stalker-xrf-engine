import { patrol } from "xray16";

import { registry } from "@/engine/core/database/registry";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type {
  Flags32,
  GameObject,
  LuaArray,
  Nillable,
  Patrol,
  TCount,
  TDistance,
  TIndex,
  TName,
  TRate,
  Vector,
} from "@/engine/lib/types";

/**
 *
 * @param object - Target object to check.
 * @param patrolPath - Target patrol to check.
 * @param patrolPointIndex - Index of patrol to check.
 * @returns Whether object reached patrol point with provided index.
 */
export function isObjectAtWaypoint(object: GameObject, patrolPath: Patrol, patrolPointIndex: TIndex): boolean {
  const objectPosition: Vector = object.position();
  const distance: TDistance = objectPosition.distance_to_sqr(patrolPath.point(patrolPointIndex));

  return distance <= 0.13;
}

/**
 * Check if object standing on terminal patrol waypoint.
 * Verifies that object is on one of terminal waypoints.
 *
 * @param object - Game object to check.
 * @param patrol - Target patrol object to check.
 * @returns [whether on terminal point, terminal point index].
 */
export function isObjectAtTerminalWaypoint(
  object: GameObject,
  patrol: Patrol
): LuaMultiReturn<[boolean, Nillable<TIndex>]> {
  for (const index of $range(0, patrol.count() - 1)) {
    // Check if point is terminal, then compare object position against it.
    if (patrol.terminal(index) && isObjectAtWaypoint(object, patrol, index)) {
      return $multi(true, index);
    }
  }

  return $multi(false, null);
}

/**
 * Check if all points of patrol are in restrictor.
 *
 * Todo: isSafeJob checks looks like `!== false`, probably should be corrected.
 *
 * @param restrictorName - Name of restrictor to check patrol in.
 * @param patrolName - Name of patrol to check.
 * @returns Whether all points of patrol are in restrictor zone.
 */
export function isPatrolInRestrictor(restrictorName: Nillable<TName>, patrolName: TName): Nillable<boolean> {
  if ($isNil(restrictorName)) {
    return null;
  }

  const restrictor: Nillable<GameObject> = registry.zones.get(restrictorName);

  if (restrictor === null) {
    return null;
  }

  const patrolObject: Patrol = new patrol(patrolName);
  const count: TCount = patrolObject.count();

  for (const point of $range(0, count - 1)) {
    if (!restrictor.inside(patrolObject.point(point))) {
      return false;
    }
  }

  return true;
}

/**
 * Choose point from patrol matching required flags.
 *
 * Todo: Is patrol needed? Probably just waypoints and flags.
 *
 * @param patrol - Patrol object to check for random waypoint.
 * @param waypoints - Patrol waypoint descriptors list.
 * @param flags - Search flags to look for in the list.
 * @returns [index of selected point, count of matching points].
 */
export function choosePatrolWaypointByFlags(
  patrol: Patrol,
  waypoints: LuaArray<IWaypointData>,
  flags: Flags32
): LuaMultiReturn<[Nillable<TIndex>, TCount]> {
  let chosenPointIndex: Nillable<TIndex> = null;
  let countOfPossiblePoints: TCount = 0;
  let pointsTotalWeight: TCount = 0;

  for (const lookIndex of $range(0, patrol.count() - 1)) {
    if (waypoints.get(lookIndex).flags.equal(flags)) {
      countOfPossiblePoints += 1;

      const probabilityRaw: Nillable<string> = waypoints.get(lookIndex).p;
      const pointLookWeight: TRate = probabilityRaw ? (tonumber(probabilityRaw) as TRate) : 100;

      // Sum up weight.
      pointsTotalWeight += pointLookWeight;

      // Check chance against total.
      if (math.random(1, pointsTotalWeight) <= pointLookWeight) {
        chosenPointIndex = lookIndex;
      }
    }
  }

  return $multi(chosenPointIndex, countOfPossiblePoints);
}

/**
 * @param patrol - Target patrol to check.
 * @param index - Point index of the patrol to check.
 * @returns Flag 32 bit index or null if patrol is not flagged at all.
 */
export function getPatrolFlag(patrol: Patrol, index: TIndex): Nillable<TIndex> {
  for (const flag of $range(0, 31)) {
    if (patrol.flag(index, flag)) {
      return flag;
    }
  }

  return null;
}
