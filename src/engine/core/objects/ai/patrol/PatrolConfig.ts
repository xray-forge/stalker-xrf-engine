import { TName, TNumberId } from "@/engine/lib/types";

export const patrolConfig = {
  /**
   * List of synchronization groups for game patrols.
   * Related to stalkers patrol manager.
   */
  PATROL_TEAMS: new LuaTable<TName, LuaTable<TNumberId, boolean>>(),
};
