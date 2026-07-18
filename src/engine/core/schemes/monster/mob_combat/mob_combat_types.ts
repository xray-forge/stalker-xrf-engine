import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import type { EScheme } from "@/engine/lib/types";

/**
 * Combat scheme state for monster.
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.MOB_COMBAT]: ISchemeMobCombatState;
  }
}
