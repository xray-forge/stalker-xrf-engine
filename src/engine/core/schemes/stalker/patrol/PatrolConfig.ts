import { PatrolManager } from "@/engine/core/schemes/stalker/patrol/PatrolManager";
import { TStringId } from "@/engine/lib/types";

export const patrolConfig = {
  /**
   * List of active patrols.
   */
  PATROLS: new LuaTable<TStringId, PatrolManager>(),
};
