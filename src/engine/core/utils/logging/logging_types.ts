import { TPath } from "@/engine/lib/types";

/**
 * Type of logging format.
 * Whether data should be written into single direction or to all possible types.
 */
export enum ELuaLoggerMode {
  SINGLE,
  DUAL,
}

/**
 * Configuration of logger to manage mode / direction / state of the logger.
 */
export interface ILuaLoggerConfig {
  isEnabled?: boolean;
  file?: TPath;
  mode?: ELuaLoggerMode;
}
