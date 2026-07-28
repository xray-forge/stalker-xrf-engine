import { Nillable, TDuration, TName, TNumberId } from "xray16/lib";

import { StalkerAnimationController } from "@/engine/core/ai/state/StalkerAnimationController";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
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
 * Helper tying partial controller keys to the real state controller fields.
 */
type TPartialStateControllerOf<K extends keyof StalkerStateController, V> = Record<K, V>;

/**
 * Partial animation manager interface for post combat action handling.
 */
export type IPartialAnimationController = TPartialStateControllerOf<
  "animstateController",
  {
    state: {
      animationMarker: null;
    };
  }
>;

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.POST_COMBAT_IDLE]: ISchemePostCombatIdleState;
  }
}
