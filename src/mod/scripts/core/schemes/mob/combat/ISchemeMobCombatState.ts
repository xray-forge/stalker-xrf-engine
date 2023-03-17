import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { MobCombatManager } from "@/mod/scripts/core/schemes/mob/combat/MobCombatManager";

/**
 * todo;
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}
