import { XR_game_object } from "xray16";

import { AnyArgs, AnyObject } from "@/mod/lib/types";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function issueEvent(object: XR_game_object, state: AnyObject, event_fn: string, ...rest: AnyArgs): void {
  if (!state || !state.actions) {
    return;
  }

  let activation_count: number = 0;

  for (const [action_ptr, is_active] of (state as { actions: LuaTable<LuaTable, boolean> }).actions) {
    if (is_active && action_ptr.get(event_fn)) {
      action_ptr.get(event_fn)(action_ptr, ...rest);
      activation_count = activation_count + 1;
    }
  }
}
