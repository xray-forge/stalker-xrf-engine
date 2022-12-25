import { AnyArgs } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/debug");

/**
 * Call game abort and print reason.
 */
export function abort(format: string, ...rest: AnyArgs): never {
  const reason: string = string.format(format, ...rest);

  return log.error("[abort] Aborting:", reason) as never;
}

/**
 * Print callstack for debugging.
 */
export function callstack(): void {
  if (debug !== null) {
    log.info("[callstack][traceback]", debug.traceback(5));
  }
}
