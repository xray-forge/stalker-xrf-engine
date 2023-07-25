import { anim, move } from "xray16";

import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/objects/animation/state_types";
import {
  IStateManagerCallbackDescriptor,
  ITargetStateDescriptorExtras,
  StalkerStateManager,
} from "@/engine/core/objects/state/StalkerStateManager";
import { ClientObject, Optional, TDuration } from "@/engine/lib/types";

/**
 * Register stalker binder object.
 *
 * @param stalker - generic stalker binder to register
 * @returns object registry state
 */
export function registerStalker(stalker: StalkerBinder): IRegistryObjectState {
  registry.stalkers.set(stalker.object.id(), true);

  return registerObject(stalker.object);
}

/**
 * Unregister stalker binder object.
 *
 * @param stalker - generic stalker binder to unregister
 * @param destroy - whether object registry state should be also destroyed
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
 * @param object - target game object
 * @param state - target animation state
 * @param callback - callback parameters to execute on animation / animation end
 * @param timeout - state execution timeout
 * @param target - animation direction target object / position parameters
 * @param extra - additional state configuration
 */
export function setStalkerState(
  object: ClientObject,
  state: EStalkerState,
  callback: Optional<IStateManagerCallbackDescriptor> = null,
  timeout: Optional<TDuration> = null,
  target: Optional<ILookTargetDescriptor> = null,
  extra: Optional<ITargetStateDescriptorExtras> = null
): void {
  registry.objects
    .get(object.id())
    .stateManager?.setState(
      state,
      callback as Optional<IStateManagerCallbackDescriptor>,
      timeout as Optional<TDuration>,
      target as Optional<ILookTargetDescriptor>,
      extra as Optional<ITargetStateDescriptorExtras>
    );
}

/**
 * Get current stalker object state.
 *
 * @param object - target stalker object to get state from
 * @returns target stalker object current state
 */
export function getStalkerState(object: ClientObject): Optional<EStalkerState> {
  return registry.objects.get(object.id()).stateManager?.getState() as Optional<EStalkerState>;
}

/**
 * Reset object animation state to idle and stop performing previous animation.
 *
 * @param object - target stalker object to reset state
 */
export function resetStalkerState(object: ClientObject): void {
  const stateManager: StalkerStateManager = registry.objects.get(object.id()).stateManager!;

  if (stateManager === null) {
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
