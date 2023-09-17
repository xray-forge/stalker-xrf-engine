import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";

/**
 * todo;
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}
