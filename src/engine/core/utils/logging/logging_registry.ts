import { TPath } from "xray16/lib";

/**
 * Registry storing file references for lua loggers.
 */
export const loggingRegistry: LuaTable<TPath, LuaFile> = new LuaTable();
