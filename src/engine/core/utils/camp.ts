import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EObjectCampRole } from "@/engine/core/managers/camp/camp_types";
import type { CampManager } from "@/engine/core/managers/camp/CampManager";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { isObjectMeeting } from "@/engine/core/utils/planner";
import { GameObject, Optional, TCount, TNumberId } from "@/engine/lib/types";

/**
 * Start playing guitar for an object.
 * Checks whether object is in camp and tries to start new guitar action with guitar playing.
 *
 * @param object - stalker client object to start playing guitar for
 */
export function startPlayingGuitar(object: GameObject): void {
  const campId: Optional<TNumberId> = registry.objects.get(object.id()).camp;

  // Object is not in camp.
  if (campId === null) {
    return;
  }

  const manager: CampManager = registry.camps.get(campId);

  manager.storyManager.setStoryTeller(manager.directorId);
  manager.storyManager.setActiveId(manager.guitarTable.get(math.random(manager.guitarTable.length())));
  manager.isSoundManagerStarted = true;
  manager.storyManager.update();
}

/**
 * Start playing harmonica for an object.
 * Checks whether object is in camp and tries to start new harmonica action with guitar playing.
 *
 * @param object - stalker client object to start playing harmonica for
 */
export function startPlayingHarmonica(object: GameObject): void {
  const campId: Optional<TNumberId> = registry.objects.get(object.id()).camp;

  // Object is not in camp.
  if (campId === null) {
    return;
  }

  const manager: CampManager = registry.camps.get(campId);

  manager.storyManager.setStoryTeller(manager.directorId);
  manager.storyManager.setActiveId(manager.harmonicaTable.get(math.random(manager.harmonicaTable.length())));
  manager.isSoundManagerStarted = true;
  manager.storyManager.update();
}

/**
 * Checker to verify if story can be told in camp.
 * Used by animstate checkers when objects have correct animation.
 *
 * @returns whether story can be told in camp
 */
export function canTellCampStory(campManager: CampManager): boolean {
  // Nothing to tell here.
  if (campManager.storyTable.length() === 0) {
    return false;
  }

  let count: TCount = 0;

  for (const [id, v] of campManager.objects) {
    const object: Optional<GameObject> = registry.objects.get(id)?.object;

    // todo: Probably just return instead of full FOR? If 2+
    if (object !== null && !isObjectMeeting(object)) {
      count += 1;
    }
  }

  // Check whether camp has free speakers, verify that have 2+ of them.
  return count > 1;
}

/**
 * todo;
 *
 * @param campManager - manager to check
 * @returns whether guitar can be played in camp
 */
export function canPlayCampGuitar(campManager: CampManager): boolean {
  // Nothing to play here.
  if (campManager.guitarTable.length() === 0) {
    return false;
  }

  let count: TCount = 0;

  for (const [k, v] of campManager.objects) {
    count += 1;
  }

  if (count > 1) {
    for (const [objectId, objectInfo] of campManager.objects) {
      const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);
      const schemeState: Optional<ISchemeAnimpointState> = state?.activeScheme
        ? (state[state.activeScheme] as ISchemeAnimpointState)
        : null;
      const object: Optional<GameObject> = state?.object;

      if (
        object !== null &&
        objectInfo.guitar === EObjectCampRole.DIRECTOR &&
        schemeState !== null &&
        schemeState.actionNameBase === schemeState.description &&
        !isObjectMeeting(object)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 *
 * @param campManager - manager to check
 * @returns whether harmonica can be played in camp
 */
export function canPlayCampHarmonica(campManager: CampManager): boolean {
  // Nothing to play here.
  if (campManager.harmonicaTable.length() === 0) {
    return false;
  }

  let count: TCount = 0;

  // todo: Len util.
  for (const [id] of campManager.objects) {
    count += 1;
  }

  if (count > 1) {
    for (const [id, info] of campManager.objects) {
      const state: Optional<IRegistryObjectState> = registry.objects.get(id);
      const schemeState: Optional<ISchemeAnimpointState> = state?.activeScheme
        ? (state[state.activeScheme!] as ISchemeAnimpointState)
        : null;
      const object: Optional<GameObject> = state?.object;

      if (
        object !== null &&
        info.harmonica === EObjectCampRole.DIRECTOR &&
        schemeState !== null &&
        schemeState.actionNameBase === schemeState.description &&
        !isObjectMeeting(object)
      ) {
        return true;
      }
    }
  }

  return false;
}
