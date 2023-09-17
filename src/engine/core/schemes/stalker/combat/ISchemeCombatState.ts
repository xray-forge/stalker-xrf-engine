import { IBaseSchemeState } from "@/engine/core/database/types";
import { AnyObject, Optional, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export enum EScriptCombatType {
  CAMPER = "camper",
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
  combat_type: Optional<AnyObject>;
  isCamperCombatAction: Optional<boolean>;
  lastSeenEnemyAtPosition: Optional<Vector>;
  script_combat_type: Optional<EScriptCombatType>;
  currentAction: Optional<EZombieCombatAction>;
}
