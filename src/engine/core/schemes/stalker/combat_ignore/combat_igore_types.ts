import type { CombatProcessEnemyController } from "@/engine/core/schemes/stalker/combat_ignore/CombatProcessEnemyController";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Ignore combat scheme state.
 */
export interface ISchemeCombatIgnoreState extends IBaseSchemeState {
  enabled: boolean;
  action: CombatProcessEnemyController;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.COMBAT_IGNORE]: ISchemeCombatIgnoreState;
  }
}
