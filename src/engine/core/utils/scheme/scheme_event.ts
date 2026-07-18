import { GameObject } from "xray16/alias";
import { AnyArgs, AnyContextualCallable, Nillable, TName } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IBaseSchemeState, IRegistryObjectState, TSchemeSignals } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { getActiveSchemeState } from "@/engine/core/database/scheme";
import { ESchemeEvent } from "@/engine/lib/types";

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
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());
  const signals: Nillable<TSchemeSignals> = $isNotNil(state) ? getActiveSchemeState(state)?.signals : null;

  if (signals) {
    signals.set(signal, true);
  }
}
