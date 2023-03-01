import { property_evaluator, time_global, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { ActionProcessEnemy } from "@/mod/scripts/core/schemes/danger/actions/ActionProcessEnemy";
import { IPostCombatSharedState } from "@/mod/scripts/core/schemes/danger/PostCombatIdle";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PostCombatIdleEnemyEvaluator");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPostCombatIdleEnemy extends property_evaluator {
  public readonly state: IPostCombatSharedState;

  public constructor(state: IPostCombatSharedState) {
    super(null, EvaluatorPostCombatIdleEnemy.__name);

    this.state = state;
    this.state.timer = time_global();
  }

  public override evaluate(): boolean {
    const best_enemy: Optional<XR_game_object> = this.object.best_enemy();

    if (
      best_enemy !== null &&
      !ActionProcessEnemy.isEnemy(this.object, best_enemy, registry.objects.get(this.object.id()).combat_ignore!, true)
    ) {
      return false;
    }

    if (best_enemy !== null && this.state.timer !== null) {
      this.state.last_best_enemy_id = best_enemy.id();
      this.state.last_best_enemy_name = best_enemy.name();
      this.state.timer = null;

      return true;
    }

    if (best_enemy === null && this.state.timer === null) {
      const overrides = registry.objects.get(this.object.id()).overrides;
      const min = (overrides && overrides.min_post_combat_time * 1000) || 10000;
      const max = (overrides && overrides.max_post_combat_time * 1000) || 15000;

      if (this.state.last_best_enemy_id === registry.actor.id()) {
        this.state.timer = time_global();
      } else {
        this.state.timer = time_global() + math.random(min, max);
      }
    }

    if (this.state.timer === null) {
      return best_enemy !== null;
    }

    if (time_global() < this.state.timer) {
      return true;
    }

    if (this.state.animation === null) {
      return false;
    }

    this.state.animation.set_state(null);

    return this.state.animation.states.anim_marker !== null;
  }
}
