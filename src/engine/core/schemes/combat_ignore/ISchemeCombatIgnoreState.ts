import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { CombatProcessEnemyManager } from "@/engine/core/schemes/combat_ignore/CombatProcessEnemyManager";

/**
 * Ignore combat scheme state.
 */
export interface ISchemeCombatIgnoreState extends IBaseSchemeState {
  enabled: boolean;
  action: CombatProcessEnemyManager;
}
