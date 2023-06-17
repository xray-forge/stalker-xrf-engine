import { registry } from "@/engine/core/database";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes";
import { assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyArgs, AnyContextualCallable, ClientObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check if provided scheme state is active.
 * todo: Get only section, not whole state.
 */
export function isSectionActive(object: ClientObject, state: IBaseSchemeState): boolean {
  assertDefined(state.section, "Object %s '%s': state.section is null.", object.name(), state.section);

  return state.section === registry.objects.get(object.id()).active_section;
}

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
    if (isHandlerActive && actionHandler[event] !== null) {
      (actionHandler[event] as AnyContextualCallable).apply(actionHandler, rest);
    }
  }
}
