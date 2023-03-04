import { XR_game_object } from "xray16";

import { AnyArgs, AnyObject, TCount, TName } from "@/mod/lib/types";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function issueSchemeEvent(
  object: XR_game_object,
  state: AnyObject,
  eventFunction: TName,
  ...rest: AnyArgs
): void {
  if (!state || !state.actions) {
    return;
  }

  let activation_count: TCount = 0;

  for (const [action_ptr, is_active] of (state as { actions: LuaTable<LuaTable, boolean> }).actions) {
    if (is_active && action_ptr.get(eventFunction)) {
      action_ptr.get(eventFunction)(action_ptr, ...rest);
      activation_count = activation_count + 1;
    }
  }
}
