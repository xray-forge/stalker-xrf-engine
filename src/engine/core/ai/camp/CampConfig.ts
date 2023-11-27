import {
  EObjectCampActivity,
  ICampTransitionDescriptor,
  IStoryAnimationDescriptor,
} from "@/engine/core/ai/camp/camp_types";
import { canPlayCampGuitar, canPlayCampHarmonica, canTellCampStory } from "@/engine/core/ai/camp/camp_utils";
import { CampManager } from "@/engine/core/ai/camp/CampManager";
import { WEAPON_POSTFIX } from "@/engine/core/animation/types";
import { TProbability } from "@/engine/lib/types";

export const campConfig = {
  CAMP_ACTIVITIES: $fromObject<EObjectCampActivity, ICampTransitionDescriptor>({
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
  }),
  CAMP_ACTIVITY_ANIMATION: $fromObject<EObjectCampActivity, IStoryAnimationDescriptor>({
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
  }),
};
