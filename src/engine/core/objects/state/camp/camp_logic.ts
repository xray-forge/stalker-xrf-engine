import { EObjectCampActivity } from "@/engine/core/objects/state/camp/camp_types";
import type { IStoryAnimationDescriptor } from "@/engine/core/schemes/animpoint/types";

/**
 * todo;
 */
export const associativeTable: LuaTable<EObjectCampActivity, IStoryAnimationDescriptor> = $fromObject<
  EObjectCampActivity,
  IStoryAnimationDescriptor
>({
  [EObjectCampActivity.IDLE]: {
    director: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  [EObjectCampActivity.HARMONICA]: {
    director: $fromArray(["_harmonica"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  [EObjectCampActivity.GUITAR]: {
    director: $fromArray(["_guitar"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  [EObjectCampActivity.STORY]: {
    director: $fromArray(["", "_weapon"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
});
