import { anim, move, XR_game_object } from "xray16";

import { IRegistryObjectState, registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState, ITargetStateDescriptor } from "@/engine/core/objects/state";
import {
  IStateManagerCallbackDescriptor,
  ITargetStateDescriptorExtras,
  StalkerStateManager,
} from "@/engine/core/objects/state/StalkerStateManager";
import { Optional, TDuration } from "@/engine/lib/types";

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
 * todo;
 */
export function setStalkerState(
  object: XR_game_object,
  state: EStalkerState,
  callback?: Optional<IStateManagerCallbackDescriptor>,
  timeout?: Optional<TDuration>,
  target?: Optional<ITargetStateDescriptor>,
  extra?: Optional<ITargetStateDescriptorExtras>
): void {
  registry.objects
    .get(object.id())
    .stateManager?.setState(
      state,
      callback as Optional<IStateManagerCallbackDescriptor>,
      timeout as Optional<TDuration>,
      target as Optional<ITargetStateDescriptor>,
      extra as Optional<ITargetStateDescriptorExtras>
    );
}

/**
 * todo;
 */
export function getStalkerState(object: XR_game_object): Optional<EStalkerState> {
  return registry.objects.get(object.id()).stateManager?.getState() as Optional<EStalkerState>;
}

/**
 * todo;
 */
export function resetStalkerState(object: XR_game_object): void {
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
