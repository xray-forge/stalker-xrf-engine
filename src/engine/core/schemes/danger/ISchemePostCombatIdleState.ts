import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePostCombatIdleState {
  timer: Optional<number>;
  animation: Optional<any>; // From script lua class.
  last_best_enemy_id: Optional<number>;
  last_best_enemy_name: Optional<string>;
}
