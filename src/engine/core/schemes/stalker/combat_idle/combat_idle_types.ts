import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { Optional, TDuration, TName, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePostCombatIdleState {
  timer: Optional<TDuration>;
  animation: Optional<StalkerAnimationManager>;
  lastBestEnemyId: Optional<TNumberId>;
  lastBestEnemyName: Optional<TName>;
}
