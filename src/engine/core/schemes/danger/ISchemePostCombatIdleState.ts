import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import { Optional, TName, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePostCombatIdleState {
  timer: Optional<number>;
  animation: Optional<StalkerAnimationManager>;
  last_best_enemy_id: Optional<TNumberId>;
  last_best_enemy_name: Optional<TName>;
}
