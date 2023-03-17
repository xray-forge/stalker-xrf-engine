import { XR_game_object } from "xray16";

import { AnyObject, TName } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function subscribeActionForEvents(
  object: XR_game_object,
  state: IBaseSchemeState,
  newAction: TName | AnyObject | LuaTable
): void {
  if (!state.actions) {
    state.actions = new LuaTable();
  }

  state.actions.set(newAction as any, true);
}
