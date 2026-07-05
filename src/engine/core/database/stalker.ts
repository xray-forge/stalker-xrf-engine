import { anim, move } from "xray16";
import type { GameObject } from "xray16/alias";
import type { Nillable, TDuration } from "xray16/lib";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import {
  EStalkerState,
  ILookTargetDescriptor,
  IStateManagerCallbackDescriptor,
  ITargetStateDescriptorExtras,
} from "@/engine/core/animation/types";
import type { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import type { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";

/**
 * Register stalker binder object.
 *
 * @param stalker - Generic stalker binder to register.
 * @returns Object registry state.
 */
export function registerStalker(stalker: StalkerBinder): IRegistryObjectState {
  registry.stalkers.set(stalker.object.id(), true);

  return registerObject(stalker.object);
}

/**
 * Unregister stalker binder object.
 *
 * @param stalker - Generic stalker binder to unregister.
 * @param destroy - Whether object registry state should be also destroyed.
 */
export function unregisterStalker(stalker: StalkerBinder, destroy: boolean = true): void {
  registry.stalkers.delete(stalker.object.id());

  if (destroy) {
    unregisterObject(stalker.object);
  }
}

/**
 * Set stalker object state related to animation and object behaviour.
 *
 * @param object - Game object.
 * @param state - Target animation state.
 * @param callback - Callback parameters to execute on animation / animation end.
 * @param timeout - State execution timeout.
 * @param target - Animation direction target object / position parameters.
 * @param extra - Additional state configuration.
 */
export function setStalkerState(
  object: GameObject,
  state: EStalkerState,
  callback: Nillable<IStateManagerCallbackDescriptor> = null,
  timeout: Nillable<TDuration> = null,
  target: Nillable<ILookTargetDescriptor> = null,
  extra: Nillable<ITargetStateDescriptorExtras> = null
): void {
  registry.objects
    .get(object.id())
    .stateManager?.setState(
      state,
      callback as Nillable<IStateManagerCallbackDescriptor>,
      timeout as Nillable<TDuration>,
      target as Nillable<ILookTargetDescriptor>,
      extra as Nillable<ITargetStateDescriptorExtras>
    );
}

/**
 * Get current stalker object state.
 *
 * @param object - Target stalker object to get state from.
 * @returns Target stalker object current state.
 */
export function getStalkerState(object: GameObject): Nillable<EStalkerState> {
  return registry.objects.get(object.id()).stateManager?.getState() as Nillable<EStalkerState>;
}

/**
 * Reset object animation state to idle and stop performing previous animation.
 *
 * @param object - Target stalker object to reset state.
 */
export function resetStalkerState(object: GameObject): void {
  const stateManager: Nillable<StalkerStateManager> = registry.objects.get(object.id()).stateManager;

  if (!stateManager) {
    return;
  }

  stateManager.animation.setState(null, true);
  stateManager.animation.setControl();
  stateManager.animstate.setState(null, true);
  stateManager.animstate.setControl();

  stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });

  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();

  object.set_body_state(move.standing);
  object.set_mental_state(anim.free);
}
