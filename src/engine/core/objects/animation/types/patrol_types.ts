import type { EStalkerState } from "@/engine/core/objects/animation/types/state_types";

/**
 * State of stalker movement.
 */
export enum ECurrentMovementState {
  NONE = 0,
  MOVING = 1,
  STANDING = 2,
}

/**
 * todo;
 */
export interface IMovementSuggestedState {
  standing: EStalkerState;
  moving: EStalkerState;
}
