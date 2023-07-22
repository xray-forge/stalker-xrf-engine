import { LuabindClass, property_evaluator, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/combat_idle/ISchemePostCombatIdleState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { canObjectSelectAsEnemy } from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { ClientObject, Optional, TDistance, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPostCombatIdleEnemy extends property_evaluator {
  public readonly state: ISchemePostCombatIdleState;

  public constructor(state: ISchemePostCombatIdleState) {
    super(null, EvaluatorPostCombatIdleEnemy.__name);
    this.state = state;
    this.state.timer = time_global();
  }

  /**
   * Evaluate whether object can enter post-combat idle state.
   */
  public override evaluate(): boolean {
    const bestEnemy: Optional<ClientObject> = this.object.best_enemy();

    if (bestEnemy !== null && !canObjectSelectAsEnemy(this.object, bestEnemy)) {
      return false;
    }

    if (bestEnemy !== null && this.state.timer !== null) {
      this.state.last_best_enemy_id = bestEnemy.id();
      this.state.last_best_enemy_name = bestEnemy.name();
      this.state.timer = null;

      return true;
    }

    const now: TTimestamp = time_global();

    if (bestEnemy === null && this.state.timer === null) {
      const overrides = registry.objects.get(this.object.id()).overrides;
      const min: TDistance = (overrides && overrides.min_post_combat_time * 1000) || logicsConfig.POST_COMBAT_IDLE.MIN;
      const max: TDistance = (overrides && overrides.max_post_combat_time * 1000) || logicsConfig.POST_COMBAT_IDLE.MAX;

      if (this.state.last_best_enemy_id === registry.actor.id()) {
        this.state.timer = now;
      } else {
        this.state.timer = now + math.random(min, max);
      }
    }

    if (this.state.timer === null) {
      return bestEnemy !== null;
    }

    if (now < this.state.timer) {
      return true;
    }

    if (this.state.animation === null) {
      return false;
    }

    this.state.animation.setState(null);

    return this.state.animation.states.animationMarker !== null;
  }
}
