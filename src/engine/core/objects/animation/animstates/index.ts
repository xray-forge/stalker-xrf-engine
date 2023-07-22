import { animationAnimstates } from "@/engine/core/objects/animation/animstates/animation";
import { baseAnimstates } from "@/engine/core/objects/animation/animstates/base";
import { IAnimationStateDescriptor } from "@/engine/core/objects/state";
import { mergeTables } from "@/engine/core/utils/table";
import { TName } from "@/engine/lib/types";

/**
 * todo;
 */
export const animstates: LuaTable<TName, IAnimationStateDescriptor> = mergeTables(
  new LuaTable(),
  baseAnimstates,
  animationAnimstates
);
