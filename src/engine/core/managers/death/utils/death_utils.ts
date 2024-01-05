import { time_global } from "xray16";

import { getStoryIdByObjectId, registry } from "@/engine/core/database";
import { IReleaseDescriptor } from "@/engine/core/managers/death";
import { deathConfig } from "@/engine/core/managers/death/DeathConfig";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { isObjectWithKnownInfo } from "@/engine/core/utils/object";
import {
  GameObject,
  LuaArray,
  Optional,
  ServerObject,
  TDistance,
  TIndex,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * @param object - game object to check
 * @returns whether object corpse can be safely released
 */
export function canReleaseObjectCorpse(object: GameObject): boolean {
  if (getStoryIdByObjectId(object.id())) {
    return false;
  }

  if (isObjectWithKnownInfo(object)) {
    return false;
  }

  for (const [section] of dropConfig.ITEMS_KEEP) {
    if (object.object(section)) {
      return false;
    }
  }

  return true;
}

/**
 * @param descriptors - list of descriptors to check for release
 * @returns multiple values with descriptor and index of release object
 */
export function getNearestCorpseToRelease(
  descriptors: LuaArray<IReleaseDescriptor>
): LuaMultiReturn<[null, null] | [TIndex, IReleaseDescriptor]> {
  const now: TTimestamp = time_global();
  const position: Vector = registry.actor.position();

  let releaseObjectIndex: Optional<TIndex> = null;
  let releaseObjectDescriptor: Optional<IReleaseDescriptor> = null;
  let releaseObjectDistance: TDistance = deathConfig.MIN_DISTANCE_SQR;

  for (const [index, descriptor] of descriptors) {
    const object: Optional<ServerObject> = registry.simulator.object(descriptor.id);

    // May also contain objects that are being registered after game load.
    if (object) {
      // todo: Check timestamp and only then check distance as small optimization?
      const distanceToCorpseSqr: TDistance = position.distance_to_sqr(object.position);

      if (
        (descriptor.diedAt === null || now >= descriptor.diedAt + deathConfig.IDLE_AFTER_DEATH) &&
        distanceToCorpseSqr > releaseObjectDistance
      ) {
        releaseObjectDistance = distanceToCorpseSqr;
        releaseObjectIndex = index;
        releaseObjectDescriptor = descriptor;
      }
    }
  }

  return $multi(releaseObjectIndex as TIndex, releaseObjectDescriptor as IReleaseDescriptor);
}
