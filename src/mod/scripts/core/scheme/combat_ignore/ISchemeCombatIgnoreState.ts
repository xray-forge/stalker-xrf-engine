import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import type { ActionProcessEnemy } from "@/mod/scripts/core/scheme/combat_ignore/actions/ActionProcessEnemy";

/**
 * todo;
 */
export interface ISchemeCombatIgnoreState extends IBaseSchemeState {
  enabled?: boolean;
  action: ActionProcessEnemy;
}
