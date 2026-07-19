import { Vector } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { TConditionList } from "@/engine/core/ini";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.COMBAT]: ISchemeCombatState;
    [EScheme.COMBAT_CAMPER]: ISchemeCombatState;
    [EScheme.COMBAT_ZOMBIED]: ISchemeCombatState;
  }
}
