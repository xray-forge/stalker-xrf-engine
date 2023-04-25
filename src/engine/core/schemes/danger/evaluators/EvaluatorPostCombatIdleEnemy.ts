import { LuabindClass, property_evaluator, time_global, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { ActionProcessEnemy } from "@/engine/core/schemes/combat_ignore/actions/ActionProcessEnemy";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/danger/ISchemePostCombatIdleState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { EScheme, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPostCombatIdleEnemy extends property_evaluator {
  public readonly state: ISchemePostCombatIdleState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemePostCombatIdleState) {
    super(null, EvaluatorPostCombatIdleEnemy.__name);
    this.state = state;
    this.state.timer = time_global();
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const bestEnemy: Optional<XR_game_object> = this.object.best_enemy();

    if (
      bestEnemy !== null &&
      !ActionProcessEnemy.isEnemy(
        this.object,
        bestEnemy,
        registry.objects.get(this.object.id())[EScheme.COMBAT_IGNORE] as ISchemeCombatIgnoreState
      )
    ) {
      return false;
    }

    if (bestEnemy !== null && this.state.timer !== null) {
      this.state.last_best_enemy_id = bestEnemy.id();
      this.state.last_best_enemy_name = bestEnemy.name();
      this.state.timer = null;

      return true;
    }

    if (bestEnemy === null && this.state.timer === null) {
      const overrides = registry.objects.get(this.object.id()).overrides;
      const min = (overrides && overrides.min_post_combat_time * 1000) || logicsConfig.POST_COMBAT_IDLE.MIN;
      const max = (overrides && overrides.max_post_combat_time * 1000) || logicsConfig.POST_COMBAT_IDLE.MAX;

      if (this.state.last_best_enemy_id === registry.actor.id()) {
        this.state.timer = time_global();
      } else {
        this.state.timer = time_global() + math.random(min, max);
      }
    }

    if (this.state.timer === null) {
      return bestEnemy !== null;
    }

    if (time_global() < this.state.timer) {
      return true;
    }

    if (this.state.animation === null) {
      return false;
    }

    this.state.animation.setState(null);

    return this.state.animation.states.animationMarker !== null;
  }
}
