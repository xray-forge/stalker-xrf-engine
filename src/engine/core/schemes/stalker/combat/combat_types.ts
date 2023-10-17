import { IBaseSchemeState } from "@/engine/core/database/database_types";
import { TConditionList } from "@/engine/core/utils/ini";
import { Optional, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export enum EScriptCombatType {
  CAMPER = "camper",
  ZOMBIED = "zombied",
  MONOLITH = "monolith",
}

/**
 * todo;
 */
export enum EZombieCombatAction {
  SHOOT = 1,
  DANGER = 2,
}

/**
 * todo;
 */
export interface ISchemeCombatState extends IBaseSchemeState {
  enabled: boolean;
  combatType: Optional<{ condlist: TConditionList }>;
  isCamperCombatAction: Optional<boolean>;
  lastSeenEnemyAtPosition: Optional<Vector>;
  scriptCombatType: Optional<EScriptCombatType>;
  currentAction: Optional<EZombieCombatAction>;
}
