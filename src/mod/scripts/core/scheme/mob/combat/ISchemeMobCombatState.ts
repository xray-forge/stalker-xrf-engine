import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import type { MobCombatManager } from "@/mod/scripts/core/scheme/mob/combat/MobCombatManager";

/**
 * todo;
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}
