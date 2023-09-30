import { action_base, LuabindClass, time_global } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { copyVector, vectorRotateY } from "@/engine/core/utils/vector";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { ClientObject, Optional, TCount, TTimestamp, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to help remembering where enemy was and search for enemy near last location.
 */
@LuabindClass()
export class ActionLookAround extends action_base {
  public readonly state: ISchemeCombatState;
  public forgetTime: TTimestamp = 0;
  public changeDirTime: TTimestamp = 0;

  public constructor(state: ISchemeCombatState) {
    super(null, ActionLookAround.__name);
    this.state = state;
  }

  public override initialize(): void {
    logger.info("Start look around:", this.object.name());

    super.initialize();

    this.state.isCamperCombatAction = true;

    this.reset();
  }

  /**
   * Reset state of search and timeouts.
   */
  public reset(): void {
    const now: TTimestamp = time_global();
    const bestEnemy: Optional<ClientObject> = this.object.best_enemy();

    this.forgetTime = now + logicsConfig.COMBAT_SEARCH.LAST_SEEN_POSITION_TIMEOUT;
    this.changeDirTime = now + logicsConfig.COMBAT_SEARCH.SEARCH_DIRECTION_CHANGE_TIMEOUT;

    if (!this.state.lastSeenEnemyAtPosition && bestEnemy) {
      this.state.lastSeenEnemyAtPosition = bestEnemy.position();
    }

    setStalkerState(this.object, EStalkerState.HIDE, null, null, {
      lookPosition: this.state.lastSeenEnemyAtPosition,
    });
  }

  /**
   * Forget about search position or look for target in different direction.
   */
  public override execute(): void {
    super.execute();

    const now: TTimestamp = time_global();

    // Forget about place where to search.
    if (this.forgetTime < now) {
      this.state.lastSeenEnemyAtPosition = null;

      return;
    }

    // Should change direction to search for enemy.
    if (this.changeDirTime < now) {
      this.changeDirTime = now + math.random(2000, 4000);

      assertDefined(
        this.state.lastSeenEnemyAtPosition,
        "report this error to STALKER-829 bug [%s]",
        this.object.name()
      );

      const direction: Vector = vectorRotateY(
        copyVector(this.state.lastSeenEnemyAtPosition).sub(this.object.position()),
        math.random(
          logicsConfig.COMBAT_SEARCH.SEARCH_DIRECTION_ROTATION_RANGE.MIN,
          logicsConfig.COMBAT_SEARCH.SEARCH_DIRECTION_ROTATION_RANGE.MAX
        )
      );

      setStalkerState(this.object, EStalkerState.HIDE, null, null, {
        lookPosition: this.object.position().add(direction),
      });
    }
  }

  public override finalize(): void {
    logger.info("End look around:", this.object.name());

    super.finalize();

    this.state.lastSeenEnemyAtPosition = null;
    this.state.isCamperCombatAction = false;
  }

  /**
   * Handle object hit callback and reset search on hit.
   */
  public onHit(object: ClientObject, amount: TCount, direction: Vector, who: ClientObject): void {
    if (who === null || !this.state.isCamperCombatAction) {
      return;
    }

    const bestEnemy: Optional<ClientObject> = this.object?.best_enemy();

    if (bestEnemy && who.id() === bestEnemy.id()) {
      this.state.lastSeenEnemyAtPosition = bestEnemy.position();
      this.reset();
    }
  }
}
