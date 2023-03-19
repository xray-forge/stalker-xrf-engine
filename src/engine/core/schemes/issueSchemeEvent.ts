import { XR_game_object } from "xray16";

import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes/base";
import { AnyArgs, AnyCallable } from "@/engine/lib/types";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function issueSchemeEvent(
  object: XR_game_object,
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
