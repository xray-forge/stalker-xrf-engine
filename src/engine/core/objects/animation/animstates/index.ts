import { IAnimationDescriptor } from "@/engine/core/objects/animation";
import { animationAnimstates } from "@/engine/core/objects/animation/animstates/animstates";
import { mergeTables } from "@/engine/core/utils/table";
import { TName } from "@/engine/lib/types";

/**
 * List of all stalker animstates.
 */
export const animstates: LuaTable<TName, IAnimationDescriptor> = mergeTables(new LuaTable(), animationAnimstates);
