import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { MobCombatManager } from "@/engine/scripts/core/schemes/mob/combat/MobCombatManager";

/**
 * todo;
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}
