import { AnyArgs } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * Call game abort and print reason.
 */
export function abort(format: string, ...rest: AnyArgs): never {
  const reason: string = string.format(format, ...rest);

  logger.error("[abort] Aborting:", reason);
  logger.printStack();

  error(reason, 1);
}

/**
 * Print callstack for debugging.
 */
export function callstack(): void {
  if (debug !== null) {
    logger.info("[callstack][traceback]", debug.traceback(5));
  }
}
