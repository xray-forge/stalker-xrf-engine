import { anim, move, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { EStalkerState, ITargetStateDescriptor } from "@/engine/core/objects/state";
import {
  IStateManagerCallbackDescriptor,
  ITargetStateDescriptorExtras,
  StalkerStateManager,
} from "@/engine/core/objects/state/StalkerStateManager";
import { Optional, TDuration, TNumberId } from "@/engine/lib/types";

/**
 * todo: Description
 */
export function registerStalker(objectId: TNumberId): void {
  registry.stalkers.set(objectId, true);
}

/**
 * todo: Description
 */
export function unregisterStalker(objectId: TNumberId): void {
  registry.stalkers.delete(objectId);
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
