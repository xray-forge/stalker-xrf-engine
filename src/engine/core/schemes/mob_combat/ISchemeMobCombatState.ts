import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { MobCombatManager } from "@/engine/core/schemes/mob_combat/MobCombatManager";

/**
 * todo;
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}
