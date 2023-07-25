import { EStalkerState } from "@/engine/core/objects/animation";
import { ClientObject, LuaArray, TName } from "@/engine/lib/types";

/**
 * Descriptor of animpoint when object is captured in smart cover and deciding which specific animation to run.
 */
export interface IAnimpointActionDescriptor {
  name: EStalkerState;
  predicate: (this: void, object: ClientObject, isInCamp?: boolean) => boolean;
}

/**
 * Descriptor of animations when objects are participating in camp scenario.
 * One is telling, others are listening.
 */
export interface IStoryAnimationDescriptor {
  director: LuaArray<TName>;
  listener: LuaArray<TName>;
}
