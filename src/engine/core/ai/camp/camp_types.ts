import type { LuaArray, Nillable, TDuration, TName, TProbability } from "xray16/lib";

import type { CampController } from "@/engine/core/ai/camp/CampController";

/**
 * Role of object in camp stories.
 * Whether it is participating in some story/playing guitar or so.
 */
export const enum EObjectCampRole {
  NONE = 0,
  LISTENER = 1,
  DIRECTOR = 2,
}

/**
 * Activity of object in camp logic.
 */
export const enum EObjectCampActivity {
  IDLE = "idle",
  STORY = "story",
  GUITAR = "guitar",
  HARMONICA = "harmonica",
}

/**
 * Camp transition descriptor.
 */
export interface ICampTransitionDescriptor {
  directorState: Nillable<TName>;
  generalState: TName;
  minTime: TDuration;
  maxTime: TDuration;
  timeout: TDuration;
  transitions: LuaTable<EObjectCampActivity, TProbability>;
  precondition: (this: void, camp: CampController) => boolean;
}

/**
 * Camp registered object state.
 */
export interface ICampStateDescriptor extends Record<EObjectCampActivity, Nillable<EObjectCampRole>> {
  state: EObjectCampActivity;
}

/**
 * Descriptor of animations when objects are participating in camp scenario.
 * One is telling, others are listening.
 */
export interface IStoryAnimationDescriptor {
  director: LuaArray<TName>;
  listener: LuaArray<TName>;
}
