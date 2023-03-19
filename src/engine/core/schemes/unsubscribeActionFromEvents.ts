import { XR_game_object } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { AnyObject } from "@/engine/lib/types";

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
