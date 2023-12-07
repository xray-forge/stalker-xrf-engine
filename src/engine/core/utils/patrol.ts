import { patrol } from "xray16";

import { registry } from "@/engine/core/database/registry";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type {
  Flags32,
  GameObject,
  LuaArray,
  Optional,
  Patrol,
  TCount,
  TDistance,
  TIndex,
  TName,
  TRate,
  Vector,
} from "@/engine/lib/types";

/**
 * Check whether object reached patrol point with specific index.
 *
 * @param object - target object to check
 * @param patrolPath - target patrol to check
 * @param patrolPointIndex - index of patrol to check
 * @returns whether object reached patrol point
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
 * @param object - target game object to check
 * @param patrol - target patrol object to check
 * @returns [whether on terminal point, terminal point index]
 */
export function isObjectAtTerminalWaypoint(
  object: GameObject,
  patrol: Patrol
): LuaMultiReturn<[boolean, Optional<TIndex>]> {
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
 * todo: isSafeJob checks looks like `!== false`, probably should be corrected.
 *
 * @param restrictorName - name of restrictor to check patrol in
 * @param patrolName - name of patrol to check
 * @returns whether all points of patrol are in restrictor zone
 */
export function isPatrolInRestrictor(restrictorName: Optional<TName>, patrolName: TName): Optional<boolean> {
  if (restrictorName === null) {
    return null;
  }

  const restrictor: Optional<GameObject> = registry.zones.get(restrictorName);

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
 * todo: Is patrol needed? probably just waypoints and flags
 *
 * @param patrol - patrol object to check for random waypoint
 * @param waypoints - patrol waypoint descriptors list
 * @param flags - search flags to look for in the list
 * @returns [index of selected point, count of matching points]
 */
export function choosePatrolWaypointByFlags(
  patrol: Patrol,
  waypoints: LuaArray<IWaypointData>,
  flags: Flags32
): LuaMultiReturn<[Optional<TIndex>, TCount]> {
  let chosenPointIndex: Optional<TIndex> = null;
  let countOfPossiblePoints: TCount = 0;
  let pointsTotalWeight: TCount = 0;

  for (const lookIndex of $range(0, patrol.count() - 1)) {
    if (waypoints.get(lookIndex).flags.equal(flags)) {
      countOfPossiblePoints += 1;

      const probabilityRaw: Optional<string> = waypoints.get(lookIndex).p;
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
