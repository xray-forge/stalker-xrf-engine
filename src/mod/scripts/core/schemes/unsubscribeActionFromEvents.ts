import { XR_game_object } from "xray16";

import { AnyObject } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function unsubscribeActionFromEvents(object: XR_game_object, state: IBaseSchemeState, action: AnyObject): void {
  if (state.actions) {
    state.actions.delete(action);
  } else {
    state.actions = new LuaTable();
  }
}
