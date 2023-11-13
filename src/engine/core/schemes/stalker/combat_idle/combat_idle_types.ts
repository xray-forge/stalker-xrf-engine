import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { IBaseSchemeState } from "@/engine/core/database";
import { Optional, TDuration, TName, TNumberId } from "@/engine/lib/types";

/**
 * Logics configuration for post-combat idle state.
 */
export interface ISchemePostCombatIdleState extends IBaseSchemeState {
  timer: Optional<TDuration>;
  animation: Optional<StalkerAnimationManager>;
  lastBestEnemyId: Optional<TNumberId>;
  lastBestEnemyName: Optional<TName>;
}
