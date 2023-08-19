import { patrol } from "xray16";

import { registry } from "@/engine/core/database";
import { ClientObject, Optional, Patrol, TCount, TName } from "@/engine/lib/types";

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
