import { AnyArgs } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("debug");

/**
 * Call game abort and print reason.
 */
export function abort(format: string, ...rest: AnyArgs): never {
  const reason: string = string.format(format, ...rest);

  log.error("[abort] Aborting:", reason);
  log.printStack();

  error(reason, 1);
}

/**
 * Print callstack for debugging.
 */
export function callstack(): void {
  if (debug !== null) {
    log.info("[callstack][traceback]", debug.traceback(5));
  }
}
