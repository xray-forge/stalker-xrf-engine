import { TName } from "xray16/lib";

/**
 * Actor inventory slots accepted by the engine's active-slot API.
 */
export const enum EActiveItemSlot {
  NONE = 0,
  KNIFE = 1,
  SECONDARY = 2,
  PRIMARY = 3,
}

/**
 * Stable identifiers for actor control lock owners.
 *
 * @inline
 */
export enum EActorControlHandle {
  /** Scripted UI operations. */
  SCRIPT_UI = "script-ui",
  /** Regular actor sleep. */
  SLEEP = "sleep",
  /** Anabiotic sleep. */
  ANABIOTIC = "anabiotic",
  /** Surge survival. */
  SURGE = "surge",
  /** Fast travel. */
  TRAVEL = "travel",
  /** Game outro sequence. */
  OUTRO = "outro",
  /** Temporary input restriction. */
  TIMED = "timed",
}

/**
 * Visual and input restrictions applied by an actor control lock.
 *
 * @inline
 */
export enum EActorControlPolicy {
  /** Disable actor input. */
  INPUT = 1,
  /** Disable actor input and indicators. */
  INPUT_AND_INDICATORS,
  /** Hide actor UI and disable actor input without changing tools. */
  UI_ONLY,
  /** Hide actor UI and disable actor input and tools. */
  FULL_UI,
}

/**
 *  Saved state for one actor control lock.
 */
export interface IActorControlDescriptor {
  /** Diagnostic reason associated with the lock. */
  reason: TName;
  /** Restrictions applied while the lock is active. */
  policy: EActorControlPolicy;
  /** Whether the lock may memoize and clear the active item slot. */
  resetSlot: boolean;
}
