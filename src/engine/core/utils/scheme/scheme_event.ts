import { IBaseSchemeState } from "@/engine/core/database";
import { AnyArgs, AnyContextualCallable, ClientObject, ESchemeEvent } from "@/engine/lib/types";

/**
 * Emit scheme event for active `actions` list in scheme state.
 *
 * @param object - client object working on scheme
 * @param state - scheme state for emitting
 * @param event - event type to emit
 * @param rest - event args
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

  // todo: Probably it is Set and `isHandlerActive` check is not needed.
  for (const [actionHandler, isHandlerActive] of state.actions) {
    if (isHandlerActive && actionHandler[event]) {
      (actionHandler[event] as AnyContextualCallable).apply(actionHandler, rest);
    }
  }
}
