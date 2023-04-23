import { EStalkerState } from "@/engine/core/objects/state";
import { LuaArray, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IAnimpointAction {
  name: EStalkerState;
  predicate: (this: void, objectId: TNumberId, isInCamp?: boolean) => boolean;
}

/**
 * todo;
 */
export interface IStoryAnimationDescriptor {
  director: LuaArray<string>;
  listener: LuaArray<string>;
}
