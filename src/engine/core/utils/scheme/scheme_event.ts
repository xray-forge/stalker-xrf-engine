import type { IBaseSchemeState, IRegistryObjectState, TSchemeSignals } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import type {
  AnyArgs,
  AnyContextualCallable,
  EScheme,
  ESchemeEvent,
  GameObject,
  Optional,
  TName,
} from "@/engine/lib/types";

/**
 * Emit scheme event for active `actions` list in scheme state.
 *
 * @param object - game object working on scheme
 * @param state - scheme state for emitting
 * @param event - event type to emit
 * @param rest - event args
 */
export function emitSchemeEvent(
  object: GameObject,
  state: IBaseSchemeState,
  event: ESchemeEvent,
  ...rest: AnyArgs
): void {
  if (!state || !state.actions) {
    return;
  }

  // todo: Probably it is Set<T> and `isHandlerActive` check is not needed.
  for (const [actionHandler, isHandlerActive] of state.actions) {
    if (isHandlerActive && actionHandler[event]) {
      (actionHandler[event] as AnyContextualCallable).apply(actionHandler, rest);
    }
  }
}

/**
 * Set currently active scheme signal as activated for the object.
 *
 * @param object - object to set signal in state for
 * @param signal - name of the signal to set
 */
export function setObjectActiveSchemeSignal(object: GameObject, signal: TName): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());
  const signals: Optional<TSchemeSignals> = state?.[state.activeScheme as EScheme]?.signals as Optional<TSchemeSignals>;

  if (signals) {
    signals.set(signal, true);
  }
}
