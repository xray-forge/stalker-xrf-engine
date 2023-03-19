import { XR_game_object } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { AnyObject, TName } from "@/engine/lib/types";

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
