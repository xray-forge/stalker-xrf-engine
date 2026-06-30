import type { EStalkerState } from "@/engine/core/animation/types/state_types";
import type { AnyObject, Nillable, TIndex } from "@/engine/lib/types";

/**
 * Waypoint arrival type.
 */
export enum EWaypointArrivalType {
  BEFORE_ANIMATION_TURN = 1,
  AFTER_ANIMATION_TURN,
}

/**
 * Suggested stalker states for the different phases of patrol behaviour.
 */
export interface IPatrolSuggestedState {
  standing: Nillable<EStalkerState>;
  moving: Nillable<EStalkerState>;
  movingFire: Nillable<EStalkerState>;
  campering: Nillable<EStalkerState>;
  camperingFire: Nillable<EStalkerState>;
}

/**
 * Descriptor of patrol handling callback.
 * Called when starting processing animation before or after turning (`mode` is indicating it).
 */
export interface IPatrolCallbackDescriptor {
  context: AnyObject;
  // Callback to call when waypoint animation is processing.
  // May return `boolean` to indicate that `??? todo ???`.
  callback: (mode: EWaypointArrivalType, patrolRetVal: Nillable<number>, index: TIndex) => void | boolean;
}
