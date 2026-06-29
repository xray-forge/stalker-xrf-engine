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
 * @param state - Scheme state for emitting.
 * @param event - Event type to emit.
 * @param rest - Event args.
 */
export function emitSchemeEvent(state: IBaseSchemeState, event: ESchemeEvent, ...rest: AnyArgs): void {
  if (!state || !state.actions) {
    return;
  }

  for (const [actionHandler, isHandlerActive] of state.actions) {
    if (actionHandler[event]) {
      (actionHandler[event] as AnyContextualCallable).apply(actionHandler, rest);
    }
  }
}

/**
 * Set currently active scheme signal as activated for the object.
 *
 * @param object - Object to set signal in state for.
 * @param signal - Name of the signal to set.
 */
export function setObjectActiveSchemeSignal(object: GameObject, signal: TName): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());
  const signals: Optional<TSchemeSignals> = state?.[state.activeScheme as EScheme]?.signals as Optional<TSchemeSignals>;

  if (signals) {
    signals.set(signal, true);
  }
}
