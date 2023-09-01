import { TPath } from "@/engine/lib/types";

/**
 * todo;
 */
export enum ELuaLoggerMode {
  SINGLE,
  DUAL,
}

/**
 * todo;
 */
export interface ILuaLoggerConfig {
  isEnabled?: boolean;
  file?: TPath;
  mode?: ELuaLoggerMode;
}
