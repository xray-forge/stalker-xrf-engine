import { animationAnimstates } from "@/engine/core/objects/animation/animstates/animstates";
import { IAnimstateDescriptor } from "@/engine/core/objects/state";
import { mergeTables } from "@/engine/core/utils/table";
import { TName } from "@/engine/lib/types";

/**
 * todo;
 */
export const animstates: LuaTable<TName, IAnimstateDescriptor> = mergeTables(new LuaTable(), animationAnimstates);
