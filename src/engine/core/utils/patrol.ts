import { patrol } from "xray16";

import { registry } from "@/engine/core/database/registry";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import { isObjectAtWaypoint } from "@/engine/core/utils/object";
import type {
  ClientObject,
  Flags32,
  LuaArray,
  Optional,
  Patrol,
  TCount,
  TIndex,
  TName,
  TRate,
} from "@/engine/lib/types";

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

  const restrictor: Optional<ClientObject> = registry.zones.get(restrictorName);

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
 * Choose look point for patrol waypoint.
 * Used to detect where to look when reached some `walk_patrol` point.
 *
 * todo: Description.
 */
export function chooseLookPoint(
  patrolLook: Patrol,
  pathLookInfo: LuaArray<IWaypointData>,
  searchForFlags: Flags32
): LuaMultiReturn<[Optional<number>, number]> {
  let patrolChosenIdx: Optional<TIndex> = null;

  let ptsFoundTotalWeight = 0;
  let numEqualPts = 0;

  for (const lookIndex of $range(0, patrolLook.count() - 1)) {
    const thisVal = pathLookInfo.get(lookIndex).flags;

    if (thisVal.equal(searchForFlags)) {
      numEqualPts = numEqualPts + 1;

      const probabilityRaw = pathLookInfo.get(lookIndex).p;
      const pointLookWeight: TRate = probabilityRaw === null ? 100 : (tonumber(probabilityRaw) as TRate);

      ptsFoundTotalWeight = ptsFoundTotalWeight + pointLookWeight;

      const weight: TRate = math.random(1, ptsFoundTotalWeight);

      if (weight <= pointLookWeight) {
        patrolChosenIdx = lookIndex;
      }
    }
  }

  return $multi(patrolChosenIdx, numEqualPts);
}

/**
 * Check if object standing on terminal patrol waypoint.
 *
 * todo: Description.
 */
export function isObjectStandingOnTerminalWaypoint(
  object: ClientObject,
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
