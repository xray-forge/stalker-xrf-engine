import type { EStalkerState } from "@/engine/core/objects/animation/types/state_types";
import type { AnyObject, Optional, TIndex } from "@/engine/lib/types";

/**
 * State of stalker movement.
 */
export enum ECurrentMovementState {
  NONE = 0,
  MOVING = 1,
  STANDING = 2,
}

/**
 * Waypoint arrival type.
 */
export enum EWaypointArrivalType {
  BEFORE_ANIMATION_TURN = 1,
  AFTER_ANIMATION_TURN,
}

/**
 * todo;
 */
export interface IPatrolSuggestedState {
  standing: Optional<EStalkerState>;
  moving: Optional<EStalkerState>;
  moving_fire: Optional<EStalkerState>;
  campering: Optional<EStalkerState>;
  campering_fire: Optional<EStalkerState>;
}

/**
 * Descriptor of patrol handling callback.
 * Called when starting processing animation before or after turning (`mode` is indicating it).
 */
export interface IPatrolCallbackDescriptor {
  context: AnyObject;
  // Callback to call when waypoint animation is processing.
  // May return `boolean` to indicate that `??? todo ???`.
  callback: (mode: EWaypointArrivalType, patrolRetVal: Optional<number>, index: TIndex) => void | boolean;
}
