import { TPath } from "@/engine/lib/types";

/**
 * Registry storing file references for lua loggers.
 */
export const loggingRegistry: LuaTable<TPath, LuaFile> = new LuaTable();
