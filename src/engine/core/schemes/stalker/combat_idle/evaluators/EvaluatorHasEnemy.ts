import { LuabindClass, property_evaluator, time_global } from "xray16";

import { ILogicsOverrides, registry } from "@/engine/core/database";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/stalker/combat_idle/combat_idle_types";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, TDistance, TTimestamp } from "@/engine/lib/types";

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

  public override evaluate(): boolean {
    const object: GameObject = this.object;

    if (!object.alive()) {
      return false;
    }

    const state: ISchemePostCombatIdleState = this.state;
    const enemy: Optional<GameObject> = object.best_enemy();

    if (enemy) {
      if (canObjectSelectAsEnemy(object, enemy)) {
        if (state.timer) {
          state.lastBestEnemyId = enemy.id();
          state.lastBestEnemyName = enemy.name();
          state.timer = null;
        }

        return true;
      } else {
        // todo: Review the logics.
        // todo: Probably should fallback to generic logics instead and handle ignore gracefully.
        return false;
      }
    }

    const now: TTimestamp = time_global();

    if (!state.timer) {
      if (state.lastBestEnemyId === ACTOR_ID) {
        state.timer = now;
      } else {
        const overrides: Optional<ILogicsOverrides> = registry.objects.get(object.id()).overrides;
        const min: TDistance = (overrides?.minPostCombatTime ?? combatConfig.POST_COMBAT_IDLE.MIN) * 1_000;
        const max: TDistance = (overrides?.maxPostCombatTime ?? combatConfig.POST_COMBAT_IDLE.MAX) * 1_000;

        state.timer = now + math.random(min, max);
      }
    }

    // Delay enemy check for some time after direct threat fading.
    if (now < state.timer) {
      return true;
    }

    // Stop playing animation when time passed.
    if (state.animation) {
      state.animation.setState(null);

      return state.animation.state.animationMarker !== null;
    }

    return false;
  }
}
