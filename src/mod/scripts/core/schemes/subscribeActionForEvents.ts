import { XR_game_object } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function subscribeActionForEvents(npc: XR_game_object, storage: IStoredObject, new_action: object): void {
  if (!storage.actions) {
    storage.actions = new LuaTable();
  }

  storage.actions.set(new_action as any, true);
}
