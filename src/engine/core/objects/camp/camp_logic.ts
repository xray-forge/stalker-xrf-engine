import { WEAPON_POSTFIX } from "@/engine/core/objects/animation";
import {
  EObjectCampActivity,
  ICampTransitionDescriptor,
  IStoryAnimationDescriptor,
} from "@/engine/core/objects/camp/camp_types";
import type { CampManager } from "@/engine/core/objects/camp/CampManager";
import { canPlayCampGuitar, canPlayCampHarmonica, canTellCampStory } from "@/engine/core/utils/camp";
import type { TProbability } from "@/engine/lib/types";

/**
 * Descriptors of animation for specific camp activities.
 */
export const CAMP_ACTIVITY_ANIMATION: LuaTable<EObjectCampActivity, IStoryAnimationDescriptor> = $fromObject<
  EObjectCampActivity,
  IStoryAnimationDescriptor
>({
  [EObjectCampActivity.IDLE]: {
    director: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", WEAPON_POSTFIX]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", WEAPON_POSTFIX]),
  },
  [EObjectCampActivity.HARMONICA]: {
    director: $fromArray(["_harmonica"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", WEAPON_POSTFIX]),
  },
  [EObjectCampActivity.GUITAR]: {
    director: $fromArray(["_guitar"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", WEAPON_POSTFIX]),
  },
  [EObjectCampActivity.STORY]: {
    director: $fromArray(["", WEAPON_POSTFIX]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", WEAPON_POSTFIX]),
  },
});

/**
 * Descriptors of camp activities and transitions between camp activities.
 */
export const CAMP_ACTIVITIES: LuaTable<EObjectCampActivity, ICampTransitionDescriptor> = $fromObject<
  EObjectCampActivity,
  ICampTransitionDescriptor
>({
  [EObjectCampActivity.IDLE]: {
    directorState: null,
    generalState: "idle",
    minTime: 30_000,
    maxTime: 60_000,
    timeout: 0,
    transitions: $fromObject({ harmonica: 30, guitar: 30, story: 40 } as Record<EObjectCampActivity, TProbability>),
    precondition: () => true,
  },
  harmonica: {
    directorState: "play_harmonica",
    generalState: "listen",
    minTime: 10_000,
    maxTime: 11_000,
    timeout: 3000,
    transitions: $fromObject({ idle: 100, harmonica: 0, guitar: 0, story: 0 } as Record<
      EObjectCampActivity,
      TProbability
    >),
    precondition: (it: CampManager) => canPlayCampHarmonica(it),
  },
  guitar: {
    directorState: "play_guitar",
    generalState: "listen",
    minTime: 10_000,
    maxTime: 11_000,
    timeout: 4500,
    transitions: $fromObject({
      idle: 100,
      harmonica: 0,
      guitar: 0,
      story: 0,
    } as Record<EObjectCampActivity, TProbability>),
    precondition: (it: CampManager) => canPlayCampGuitar(it),
  },
  story: {
    directorState: "tell",
    generalState: "listen",
    minTime: 10_000,
    maxTime: 11_000,
    timeout: 0,
    transitions: $fromObject({ idle: 100, harmonica: 0, guitar: 0, story: 0 } as Record<
      EObjectCampActivity,
      TProbability
    >),
    precondition: (it: CampManager) => canTellCampStory(it),
  },
});
