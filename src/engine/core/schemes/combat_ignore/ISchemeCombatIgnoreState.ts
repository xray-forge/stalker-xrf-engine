import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { ActionProcessEnemy } from "@/engine/core/schemes/combat_ignore/actions/ActionProcessEnemy";

/**
 * todo;
 */
export interface ISchemeCombatIgnoreState extends IBaseSchemeState {
  enabled?: boolean;
  action: ActionProcessEnemy;
}
