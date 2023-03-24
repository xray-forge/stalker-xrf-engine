import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { EStalkerState, ITargetStateDescriptor } from "@/engine/core/objects/state";
import { AnyCallable, AnyObject, Optional, TDuration, TNumberId } from "@/engine/lib/types";

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
  callback: Optional<AnyCallable> | AnyObject,
  timeout: Optional<TDuration>,
  target: Optional<ITargetStateDescriptor>,
  extra: Optional<AnyObject>
): void {
  registry.objects.get(object.id()).state_mgr?.setState(state, callback, timeout, target, extra);
}

/**
 * todo;
 */
export function getStalkerState(object: XR_game_object): Optional<EStalkerState> {
  return registry.objects.get(object.id()).state_mgr?.getState() as Optional<EStalkerState>;
}
