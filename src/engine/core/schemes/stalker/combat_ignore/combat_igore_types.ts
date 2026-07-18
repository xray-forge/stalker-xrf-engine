import type { CombatProcessEnemyManager } from "@/engine/core/schemes/stalker/combat_ignore/CombatProcessEnemyManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * Ignore combat scheme state.
 */
export interface ISchemeCombatIgnoreState extends IBaseSchemeState {
  enabled: boolean;
  action: CombatProcessEnemyManager;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.COMBAT_IGNORE]: ISchemeCombatIgnoreState;
  }
}
