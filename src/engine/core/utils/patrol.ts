import { patrol } from "xray16";
import { Flags32, GameObject, Patrol } from "xray16/alias";
import { LuaArray, Nillable, TCount, TIndex, TName, TRate } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { registry } from "@/engine/core/database/registry";
import { type IWaypointData } from "@/engine/core/utils/ini";

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

  if ($isNil(restrictor)) {
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
