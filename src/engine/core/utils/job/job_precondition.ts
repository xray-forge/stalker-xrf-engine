import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects";
import { isInTimeInterval } from "@/engine/core/utils/game";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/job_types";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { communities } from "@/engine/lib/constants/communities";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { FALSE } from "@/engine/lib/constants/words";
import { AnyObject, Optional, ServerCreatureObject } from "@/engine/lib/types";

/**
 * Check if animpoint job is available.
 */
export function jobPreconditionAnimpoint(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return object.community() !== communities.zombied;
}

/**
 * Check if camper job is available.
 */
export function jobPreconditionCamper(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return true;
}

/**
 * Check if collector job is available.
 */
export function jobPreconditionCollector(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (object.community() === communities.zombied) {
    return false;
  }

  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id);

  if (state === null || state.object === null) {
    return false;
  }

  // todo: add object has detector util?
  for (const [, value] of pairs(detectors)) {
    if (state.object.object(value) !== null) {
      return true;
    }
  }

  return false;
}

/**
 * Check if guard job is available.
 */
export function jobPreconditionGuard(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isPatrolInRestrictor(smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if guard follower job is available.
 */
export function jobPreconditionGuardFollower(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject,
  objectInfo: IObjectJobDescriptor
): boolean {
  return objectInfo.desiredJob === parameters.nextDesiredJob;
}

/**
 * Check if patrol job is available.
 */
export function jobPreconditionPatrol(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (object.community() === communities.zombied) {
    return false;
  } else if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isPatrolInRestrictor(smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if sleep job is available.
 */
export function jobPreconditionSleep(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (object.community() === communities.zombied) {
    return false;
  } else if (!isInTimeInterval(21, 7)) {
    return false;
  } else if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isPatrolInRestrictor(smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if sniper job is available.
 */
export function jobPreconditionSniper(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return object.community() !== communities.zombied;
}

/**
 * Check if surge job is available.
 */
export function jobPreconditionSurge(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return SurgeManager.getInstance().isStarted;
}

/**
 * Check if surge job is available.
 */
export function jobPreconditionWalker(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isPatrolInRestrictor(smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if surge job is available.
 */
export function jobPreconditionExclusive(
  object: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  const result: Optional<string> = pickSectionFromCondList(registry.actor, object, parameters.condlist);

  return result !== FALSE && result !== null;
}
