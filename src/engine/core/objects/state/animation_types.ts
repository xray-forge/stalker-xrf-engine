import { EStalkerState } from "@/engine/core/objects/state/state_types";
import {
  AnyCallable,
  LuaArray,
  Optional,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

/**
 * Attach item as element of sequence.
 * Where 'a' is item section to attach.
 */
export type TAnimationAttachSequence = { a: TName };

/**
 * Detach item as element of sequence.
 * Where 'd' is item section to detach.
 */
export type TAnimationDetachSequence = { d: TName };

/**
 * Call callback as element of sequence.
 * Where 'f' is function to call.
 */
export type TAnimationCallbackSequence = { f: AnyCallable };

/**
 * Call sound as element of sequence.
 * Where 's' is sound to play.
 */
export type TAnimationSoundSequence = { s: TStringId };

/**
 * Do object hit as element of sequence.
 * Where 'sh' is hit power.
 */
export type TAnimationHitSequence = { sh: TRate };

/**
 * Element of animation sequence.
 */
export type TAnimationSequenceElement =
  | TName
  | TAnimationAttachSequence
  | TAnimationDetachSequence
  | TAnimationCallbackSequence
  | TAnimationSoundSequence
  | TAnimationHitSequence;

/**
 * Element of animation sequence.
 */
export type TAnimationSequenceElements = TAnimationSequenceElement | LuaArray<TAnimationSequenceElement>;

/**
 * todo;
 */
export interface IAnimationDescriptor {
  prop: {
    maxidle: number;
    sumidle: number;
    rnd: number;
    moving: Optional<boolean>;
  };
  into: Optional<LuaArray<TAnimationSequenceElements>>;
  out: Optional<LuaArray<TAnimationSequenceElements>>;
  idle: Optional<LuaArray<TAnimationSequenceElements>>;
  rnd: Optional<LuaArray<TAnimationSequenceElements>>;
}

/**
 * todo;
 */
export interface IAnimationStateDescriptor {
  prop: {
    maxidle: number;
    sumidle: number;
    rnd: number;
  };
  into: LuaArray<TAnimationSequenceElement>;
  out: LuaArray<TAnimationSequenceElement>;
  idle: LuaArray<TAnimationSequenceElement>;
  rnd: LuaArray<LuaTable<number, string>>;
}

/**
 * todo;
 */
export enum EWeaponAnimation {
  NONE = "none",
  DROP = "drop",
  FIRE = "fire",
  STRAPPED = "strapped",
  UNSTRAPPED = "unstrapped",
  SNIPER_FIRE = "sniper_fire",
}

/**
 * Animation lifecycle marker state.
 */
export enum EAnimationMarker {
  IN = 1,
  OUT = 2,
  IDLE = 3,
}

/**
 * todo;
 */
export interface IAnimationManagerStates {
  lastIndex: Optional<TIndex>;
  currentState: Optional<EStalkerState>;
  targetState: Optional<EStalkerState>;
  animationMarker: Optional<EAnimationMarker>;
  nextRandomAt: Optional<TTimestamp>;
  sequenceId: TNumberId;
}

/**
 * Type of animation used in manager.
 */
export enum EAnimationType {
  ANIMATION = "animation",
  ANIMSTATE = "animstate",
}
