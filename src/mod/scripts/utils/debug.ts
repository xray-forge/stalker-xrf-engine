import { AnyArgs } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/debug");

/**
 * Call game abort and print reason.
 */
export function abort(format: string, ...rest: AnyArgs): void {
  const reason: string = lua_string.format(format, ...rest);

  log.error("[abort] Aborting:", reason);
}

/**
 * Print callstack for debugging.
 */
export function callstack(): void {
  if (get_global("debug") !== null) {
    log.info("[callstack]", get_global("debug").traceback(2));
  }
}
