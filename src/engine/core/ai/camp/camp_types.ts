import type { CampManager } from "@/engine/core/ai/camp/CampManager";
import type { LuaArray, Optional, TDuration, TName, TProbability } from "@/engine/lib/types";

/**
 * Role of object in camp stories.
 * Whether it is participating in some story/playing guitar or so.
 */
export enum EObjectCampRole {
  NONE = 0,
  LISTENER = 1,
  DIRECTOR = 2,
}

/**
 * Activity of object in camp logic.
 */
export enum EObjectCampActivity {
  IDLE = "idle",
  STORY = "story",
  GUITAR = "guitar",
  HARMONICA = "harmonica",
}

/**
 * Camp transition descriptor.
 */
export interface ICampTransitionDescriptor {
  directorState: Optional<TName>;
  generalState: TName;
  minTime: TDuration;
  maxTime: TDuration;
  timeout: TDuration;
  transitions: LuaTable<EObjectCampActivity, TProbability>;
  precondition: (this: void, camp: CampManager) => boolean;
}

/**
 * Camp registered object state.
 */
export interface ICampStateDescriptor extends Record<EObjectCampActivity, Optional<EObjectCampRole>> {
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
