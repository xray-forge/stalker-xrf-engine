import { Nillable, TDuration, TName, TNumberId } from "xray16/lib";

import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { IBaseSchemeState } from "@/engine/core/database";
import { EScheme } from "@/engine/lib/types";

/**
 * Logics configuration for post-combat idle state.
 */
export interface ISchemePostCombatIdleState extends IBaseSchemeState {
  timer: Nillable<TDuration>;
  animation: Nillable<StalkerAnimationManager>;
  lastBestEnemyId: Nillable<TNumberId>;
  lastBestEnemyName: Nillable<TName>;
}

/**
 * Partial animation manager interface for post combat action handling.
 */
export interface IPartialAnimationManager {
  animstate: {
    state: {
      animationMarker: null;
    };
  };
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.POST_COMBAT_IDLE]: ISchemePostCombatIdleState;
  }
}
