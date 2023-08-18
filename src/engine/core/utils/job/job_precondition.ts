import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects";
import { isInTimeInterval } from "@/engine/core/utils/game";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isAccessibleJob, isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/job_types";
import { communities } from "@/engine/lib/constants/communities";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { FALSE } from "@/engine/lib/constants/words";
import { AnyObject, Optional, ServerCreatureObject } from "@/engine/lib/types";

/**
 * Check if animpoint job is available.
 */
export function jobPreconditionAnimpoint(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return serverObject.community() !== communities.zombied;
}

/**
 * Check if camper job is available.
 */
export function jobPreconditionCamper(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return isAccessibleJob(serverObject, parameters.wayName);
}

/**
 * Check if collector job is available.
 */
export function jobPreconditionCollector(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (serverObject.community() === communities.zombied) {
    return false;
  }

  const state: Optional<IRegistryObjectState> = registry.objects.get(serverObject.id);

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
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if guard follower job is available.
 */
export function jobPreconditionGuardFollower(
  serverObject: ServerCreatureObject,
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
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (serverObject.community() === communities.zombied) {
    return false;
  } else if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if sleep job is available.
 */
export function jobPreconditionSleep(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (serverObject.community() === communities.zombied) {
    return false;
  } else if (!isInTimeInterval(21, 7)) {
    return false;
  } else if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if sniper job is available.
 */
export function jobPreconditionSniper(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return serverObject.community() !== communities.zombied && isAccessibleJob(serverObject, parameters.wayName);
}

/**
 * Check if surge job is available.
 */
export function jobPreconditionSurge(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  return SurgeManager.getInstance().isStarted;
}

/**
 * Check if surge job is available.
 */
export function jobPreconditionWalker(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  if (smartTerrain.alarmStartedAt === null) {
    return true;
  } else if (smartTerrain.safeRestrictor === null) {
    return true;
  }

  if (parameters.isSafeJob === null) {
    parameters.isSafeJob = isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, parameters.wayName);
  }

  return parameters.isSafeJob !== false;
}

/**
 * Check if surge job is available.
 */
export function jobPreconditionExclusive(
  serverObject: ServerCreatureObject,
  smartTerrain: SmartTerrain,
  parameters: AnyObject
): boolean {
  const result: Optional<string> = pickSectionFromCondList(registry.actor, serverObject, parameters.condlist);

  return result !== FALSE && result !== null;
}
