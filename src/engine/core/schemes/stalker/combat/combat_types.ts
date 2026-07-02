import { IBaseSchemeState } from "@/engine/core/database/database_types";
import { TConditionList } from "@/engine/core/utils/ini";
import { Nillable, Vector } from "@/engine/lib/types";

/**
 * Type of combat used by game object.
 * Each type overrides default behaviour and forces specific logics.
 */
export const enum EScriptCombatType {
  CAMPER = "camper",
  ZOMBIED = "zombied",
  MONOLITH = "monolith",
}

/**
 * Current action type for zombie combat.
 * Since zombies can do only few things, it includes related definitions.
 */
export const enum EZombieCombatAction {
  SHOOT = 1,
  DANGER = 2,
}

/**
 * State of combat scheme.
 * Configuration and parameters of current combat behaviour.
 */
export interface ISchemeCombatState extends IBaseSchemeState {
  enabled: boolean;
  combatType: Nillable<{ condlist: TConditionList }>;
  isCamperCombatAction: Nillable<boolean>;
  lastSeenEnemyAtPosition: Nillable<Vector>;
  scriptCombatType: Nillable<EScriptCombatType>;
  currentAction: Nillable<EZombieCombatAction>;
}
