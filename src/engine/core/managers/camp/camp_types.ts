import type { CampManager } from "@/engine/core/managers/camp/index";
import { LuaLogger } from "@/engine/core/utils/logging";
import type { LuaArray, Optional, TDuration, TName, TProbability } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
 * Camp registed object state.
 */
export interface ICampObjectState extends Record<EObjectCampActivity, Optional<EObjectCampRole>> {
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
