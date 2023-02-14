import { XR_game_object } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function unsubscribeActionFromEvents(npc: XR_game_object, storage: IStoredObject, new_action: any): void {
  if (storage.actions) {
    storage.actions.delete(new_action);
  } else {
    storage.actions = new LuaTable();
  }
}
