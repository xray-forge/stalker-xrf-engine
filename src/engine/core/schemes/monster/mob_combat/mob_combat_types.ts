import type { MobCombatController } from "@/engine/core/schemes/monster/mob_combat/MobCombatController";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Combat scheme state for monster.
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatController;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MOB_COMBAT]: ISchemeMobCombatState;
  }
}
