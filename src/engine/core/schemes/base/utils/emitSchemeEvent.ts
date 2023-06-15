import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes/base";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyArgs, AnyCallable, ClientObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 * todo
 * todo
 * todo
 */
export function emitSchemeEvent(
  object: ClientObject,
  state: IBaseSchemeState,
  event: ESchemeEvent,
  ...rest: AnyArgs
): void {
  if (!state || !state.actions) {
    return;
  }

  for (const [actionHandler, isHandlerActive] of state.actions) {
    if (isHandlerActive && actionHandler[event] !== null) {
      (actionHandler[event] as AnyCallable)(actionHandler, ...rest);
    }
  }
}
