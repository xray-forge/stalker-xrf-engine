import type { IBaseSchemeState } from "@/engine/core/schemes/base";
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
  last_seen_pos: Optional<Vector>;
  script_combat_type: Optional<EScriptCombatType>;
  currentAction: Optional<EZombieCombatAction>;
}
