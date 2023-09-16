import type { EStalkerState } from "@/engine/core/objects/animation/types/state_types";
import type { AnyCallable, AnyObject, Optional } from "@/engine/lib/types";

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
 * todo;
 */
export interface IPatrolCallbackDescriptor {
  context: AnyObject;
  callback: AnyCallable;
}
