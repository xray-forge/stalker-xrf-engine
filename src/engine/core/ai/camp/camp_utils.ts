import { EObjectCampActivity, EObjectCampRole } from "@/engine/core/ai/camp/camp_types";
import type { CampManager } from "@/engine/core/ai/camp/CampManager";
import { WEAPON_POSTFIX } from "@/engine/core/animation/types";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IAnimpointActionDescriptor, ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { isObjectMeeting } from "@/engine/core/utils/planner";
import { GameObject, LuaArray, Optional, TCount, TName, TNumberId } from "@/engine/lib/types";

/**
 * Start playing guitar for an object.
 * Checks whether object is in camp and tries to start new guitar action with guitar playing.
 *
 * @param object - stalker game object to start playing guitar for
 */
export function startPlayingGuitar(object: GameObject): void {
  const campId: Optional<TNumberId> = registry.objects.get(object.id()).camp;

  if (!campId) {
    return;
  }

  const manager: CampManager = registry.camps.get(campId);

  manager.isStoryStarted = true;
  manager.storyManager.setStoryTeller(manager.directorId);
  manager.storyManager.setActiveStory(
    manager.availableGuitarStories.get(math.random(manager.availableGuitarStories.length()))
  );
  manager.storyManager.update();
}

/**
 * Start playing harmonica for an object.
 * Checks whether object is in camp and tries to start new harmonica action with guitar playing.
 *
 * @param object - stalker game object to start playing harmonica for
 */
export function startPlayingHarmonica(object: GameObject): void {
  const campId: Optional<TNumberId> = registry.objects.get(object.id()).camp;

  if (!campId) {
    return;
  }

  const manager: CampManager = registry.camps.get(campId);

  manager.isStoryStarted = true;
  manager.storyManager.setStoryTeller(manager.directorId);
  manager.storyManager.setActiveStory(
    manager.availableHarmonicaStories.get(math.random(manager.availableHarmonicaStories.length()))
  );
  manager.storyManager.update();
}

/**
 * @param manager - manager to check
 * @returns whether guitar can be played in camp
 */
export function canPlayCampGuitar(manager: CampManager): boolean {
  if (manager.availableGuitarStories.length() === 0 || table.size(manager.objects) < 2) {
    return false;
  }

  for (const [objectId, objectInfo] of manager.objects) {
    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);
    const schemeState: Optional<ISchemeAnimpointState> = state?.activeScheme
      ? (state[state.activeScheme] as ISchemeAnimpointState)
      : null;
    const object: Optional<GameObject> = state?.object;

    if (
      object &&
      schemeState &&
      objectInfo.guitar === EObjectCampRole.DIRECTOR &&
      schemeState.actionNameBase === schemeState.description &&
      !isObjectMeeting(object)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * @param manager - manager instance to check
 * @returns whether harmonica can be played in camp
 */
export function canPlayCampHarmonica(manager: CampManager): boolean {
  // Nothing to play here.
  if (manager.availableHarmonicaStories.length() === 0 || table.size(manager.objects) < 2) {
    return false;
  }

  for (const [id, info] of manager.objects) {
    const state: Optional<IRegistryObjectState> = registry.objects.get(id);
    const schemeState: Optional<ISchemeAnimpointState> = state?.activeScheme
      ? (state[state.activeScheme!] as ISchemeAnimpointState)
      : null;
    const object: Optional<GameObject> = state?.object;

    if (
      object &&
      schemeState &&
      info.harmonica === EObjectCampRole.DIRECTOR &&
      schemeState.actionNameBase === schemeState.description &&
      !isObjectMeeting(object)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checker to verify if story can be told in camp.
 * Used by animstate checkers when objects have correct animation.
 *
 * @returns whether story can be told in camp
 */
export function canTellCampStory(manager: CampManager): boolean {
  // Nothing to tell here.
  if (manager.availableSoundStories.length() === 0) {
    return false;
  }

  let count: TCount = 0;

  for (const [id] of manager.objects) {
    const object: Optional<GameObject> = registry.objects.get(id)?.object;

    if (object && !isObjectMeeting(object)) {
      count += 1;
    }

    // Need just two speakers to assume story can be told.
    if (count === 2) {
      return true;
    }
  }

  // Check whether camp has free speakers, verify that have 2+ of them.
  return false;
}

/**
 * Get object role based on id/state for current camp activity.
 *
 * @param objectId - target game object id
 * @param activity - camp activity name to check role for
 * @returns whether object animpoint state is correct and what role can be used for it
 */
export function getObjectCampActivityRole(objectId: TNumberId, activity: EObjectCampActivity): EObjectCampRole {
  const schemeState: Optional<ISchemeAnimpointState> = registry.objects.get(objectId)[
    registry.objects.get(objectId).activeScheme!
  ] as ISchemeAnimpointState;

  // Object is not captured in animation state scheme (sitting / laying / telling etc).
  if (!schemeState) {
    return EObjectCampRole.NONE;
  }

  const objectActions: LuaArray<IAnimpointActionDescriptor> = schemeState.approvedActions;
  let stalkerState: Optional<TName> = schemeState.description as TName;

  switch (activity) {
    case EObjectCampActivity.HARMONICA:
    case EObjectCampActivity.GUITAR:
      stalkerState += `_${activity}`;

      for (const [, action] of objectActions) {
        if (action.name === stalkerState) {
          return EObjectCampRole.DIRECTOR;
        }
      }

      return EObjectCampRole.LISTENER;

    case EObjectCampActivity.STORY:
      for (const [, action] of objectActions) {
        if (action.name === stalkerState || action.name === stalkerState + WEAPON_POSTFIX) {
          return EObjectCampRole.DIRECTOR;
        }
      }

      return EObjectCampRole.LISTENER;

    case EObjectCampActivity.IDLE:
      return EObjectCampRole.LISTENER;

    default:
      return EObjectCampRole.NONE;
  }
}
