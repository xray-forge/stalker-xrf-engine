import type { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * Combat scheme state for monster.
 */
export interface ISchemeMobCombatState extends IBaseSchemeState {
  enabled: boolean;
  action: MobCombatManager;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MOB_COMBAT]: ISchemeMobCombatState;
  }
}
