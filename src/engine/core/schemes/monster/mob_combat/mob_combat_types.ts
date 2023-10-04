import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";

/**
 * Combat scheme state for monster.
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}
