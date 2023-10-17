import { LuabindClass, property_evaluator, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/stalker/combat_idle/combat_idle_types";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, TDistance, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether any enemy exists.
 */
@LuabindClass()
export class EvaluatorHasEnemy extends property_evaluator {
  public readonly state: ISchemePostCombatIdleState;

  public constructor(state: ISchemePostCombatIdleState) {
    super(null, EvaluatorHasEnemy.__name);
    this.state = state;
    this.state.timer = time_global();
  }

  /**
   * Evaluate whether object has enemy or searching for one.
   */
  public override evaluate(): boolean {
    if (!this.object.alive()) {
      return false;
    }

    const bestEnemy: Optional<GameObject> = this.object.best_enemy();

    if (bestEnemy !== null && !canObjectSelectAsEnemy(this.object, bestEnemy)) {
      return false;
    }

    if (bestEnemy !== null && this.state.timer !== null) {
      this.state.lastBestEnemyId = bestEnemy.id();
      this.state.lastBestEnemyName = bestEnemy.name();
      this.state.timer = null;

      return true;
    }

    const now: TTimestamp = time_global();

    if (bestEnemy === null && this.state.timer === null) {
      const overrides = registry.objects.get(this.object.id()).overrides;
      const min: TDistance = overrides?.minPostCombatTime * 1000 || combatConfig.POST_COMBAT_IDLE.MIN;
      const max: TDistance = overrides?.maxPostCombatTime * 1000 || combatConfig.POST_COMBAT_IDLE.MAX;

      if (this.state.lastBestEnemyId === ACTOR_ID) {
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

    return this.state.animation.state.animationMarker !== null;
  }
}
