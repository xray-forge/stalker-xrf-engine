import { XR_game_object } from "xray16";

import { AnyArgs, AnyCallable } from "@/mod/lib/types";
import { ESchemeEvent, IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

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
