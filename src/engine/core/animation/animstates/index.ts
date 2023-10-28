import { animationAnimstates } from "@/engine/core/animation/animstates/animstates";
import { IAnimationDescriptor } from "@/engine/core/animation/types";
import { mergeTables } from "@/engine/core/utils/table";
import { TName } from "@/engine/lib/types";

/**
 * List of all stalker animstates.
 */
export const animstates: LuaTable<TName, IAnimationDescriptor> = mergeTables(new LuaTable(), animationAnimstates);
