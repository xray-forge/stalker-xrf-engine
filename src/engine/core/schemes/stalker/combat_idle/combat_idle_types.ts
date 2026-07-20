import { Nillable, TDuration, TName, TNumberId } from "xray16/lib";

import { StalkerAnimationController } from "@/engine/core/ai/state/StalkerAnimationController";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Logics configuration for post-combat idle state.
 */
export interface ISchemePostCombatIdleState extends IBaseSchemeState {
  timer: Nillable<TDuration>;
  animation: Nillable<StalkerAnimationController>;
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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.POST_COMBAT_IDLE]: ISchemePostCombatIdleState;
  }
}
