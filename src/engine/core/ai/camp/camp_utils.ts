import { GameObject } from "xray16/alias";
import { LuaArray, Nillable, TCount, TName, TNumberId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { EObjectCampActivity, EObjectCampRole } from "@/engine/core/ai/camp/camp_types";
import { type CampManager } from "@/engine/core/ai/camp/CampManager";
import { WEAPON_POSTFIX } from "@/engine/core/animation/types";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getActiveSchemeState } from "@/engine/core/schemes";
import { IAnimpointActionDescriptor, ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { isObjectMeeting } from "@/engine/core/utils/planner";

/**
 * Start playing guitar for an object.
 * Checks whether object is in camp and tries to start new guitar action with guitar playing.
 *
 * @param object - Stalker game object to start playing guitar for.
 */
export function startPlayingGuitar(object: GameObject): void {
  const campId: Nillable<TNumberId> = registry.objects.get(object.id()).camp;

  if ($isNil(campId)) {
    return;
  }

  const manager: CampManager = registry.camps.get(campId);

  manager.isStoryStarted = true;
  manager.storyManager.setStoryTeller(manager.directorId);
  manager.storyManager.setActiveStory(table.random(manager.availableGuitarStories)[1]);
  manager.storyManager.update();
}

/**
 * Start playing harmonica for an object.
 * Checks whether object is in camp and tries to start new harmonica action with guitar playing.
 *
 * @param object - Stalker game object to start playing harmonica for.
 */
export function startPlayingHarmonica(object: GameObject): void {
  const campId: Nillable<TNumberId> = registry.objects.get(object.id()).camp;

  if ($isNil(campId)) {
    return;
  }

  const manager: CampManager = registry.camps.get(campId);

  manager.isStoryStarted = true;
  manager.storyManager.setStoryTeller(manager.directorId);
  manager.storyManager.setActiveStory(table.random(manager.availableHarmonicaStories)[1]);
  manager.storyManager.update();
}

/**
 * @param manager - Manager to check.
 * @returns Whether guitar can be played in camp.
 */
export function canPlayCampGuitar(manager: CampManager): boolean {
  if (manager.availableGuitarStories.length() === 0 || table.size(manager.objects) < 2) {
    return false;
  }

  for (const [objectId, objectInfo] of manager.objects) {
    const state: Nillable<IRegistryObjectState> = registry.objects.get(objectId);
    const schemeState: Nillable<ISchemeAnimpointState> = $isNotNil(state) ? getActiveSchemeState(state) : null;
    const object: Nillable<GameObject> = state?.object;

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
 * @param manager - Manager instance to check.
 * @returns Whether harmonica can be played in camp.
 */
export function canPlayCampHarmonica(manager: CampManager): boolean {
  // Nothing to play here.
  if (manager.availableHarmonicaStories.length() === 0 || table.size(manager.objects) < 2) {
    return false;
  }

  for (const [id, info] of manager.objects) {
    const state: Nillable<IRegistryObjectState> = registry.objects.get(id);
    const schemeState: Nillable<ISchemeAnimpointState> = $isNotNil(state) ? getActiveSchemeState(state) : null;
    const object: Nillable<GameObject> = state?.object;

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
 * @returns Whether story can be told in camp.
 */
export function canTellCampStory(manager: CampManager): boolean {
  // Nothing to tell here.
  if (manager.availableSoundStories.length() === 0) {
    return false;
  }

  let count: TCount = 0;

  for (const [id] of manager.objects) {
    const object: Nillable<GameObject> = registry.objects.get(id)?.object;

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
 * @param objectId - Game object ID.
 * @param activity - Camp activity name to check role for.
 * @returns Whether object animpoint state is correct and what role can be used for it.
 */
export function getObjectCampActivityRole(objectId: TNumberId, activity: EObjectCampActivity): EObjectCampRole {
  const state: IRegistryObjectState = registry.objects.get(objectId);
  const schemeState: Nillable<ISchemeAnimpointState> = getActiveSchemeState(state);

  // Object is not captured in animation state scheme (sitting / laying / telling etc).
  if (!schemeState) {
    return EObjectCampRole.NONE;
  }

  const objectActions: LuaArray<IAnimpointActionDescriptor> = schemeState.approvedActions;
  let stalkerState: Nillable<TName> = schemeState.description as TName;

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
        if (action.name === stalkerState || action.name === `${stalkerState}${WEAPON_POSTFIX}`) {
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
