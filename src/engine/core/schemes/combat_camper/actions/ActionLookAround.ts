import { action_base, device, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { copyVector, vectorRotateY } from "@/engine/core/utils/vector";
import { ClientObject, Optional, TCount, TRate, TTimestamp, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionLookAround extends action_base {
  public readonly state: ISchemeCombatState;
  public forget_time: TTimestamp = 0;
  public change_dir_time: TTimestamp = 0;

  public constructor(state: ISchemeCombatState) {
    super(null, ActionLookAround.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.state.isCamperCombatAction = true;

    this.reset();
  }

  /**
   * todo: Description.
   */
  public reset(): void {
    this.forget_time = device().time_global() + 30_000;
    this.change_dir_time = device().time_global() + 15_000;

    if (!this.state.last_seen_pos && this.object.best_enemy() !== null) {
      this.state.last_seen_pos = this.object.best_enemy()!.position();
    }

    setStalkerState(
      this.object,
      EStalkerState.HIDE,
      null,
      null,
      { lookPosition: this.state.last_seen_pos, lookObject: null },
      null
    );
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.forget_time < device().time_global()) {
      this.state.last_seen_pos = null;

      return;
    }

    if (this.change_dir_time < device().time_global()) {
      this.change_dir_time = device().time_global() + math.random(2000, 4000);

      const angle: TRate = math.random(0, 120) - 60;

      if (this.state.last_seen_pos === null) {
        abort("report this error to STALKER-829 bug [%s]", this.object.name());
      }

      let direction: Vector = copyVector(this.state.last_seen_pos).sub(this.object.position());

      direction = vectorRotateY(direction, angle);

      setStalkerState(
        this.object,
        EStalkerState.HIDE,
        null,
        null,
        { lookPosition: this.object.position().add(direction), lookObject: null },
        null
      );
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();

    this.state.last_seen_pos = null;
    this.state.isCamperCombatAction = false;
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    object: ClientObject,
    amount: TCount,
    const_direction: Vector,
    who: ClientObject,
    bone_index: string
  ): void {
    if (who === null || !this.state.isCamperCombatAction) {
      return;
    }

    const bestEnemy: Optional<ClientObject> = this.object?.best_enemy();

    if (bestEnemy && who.id() === bestEnemy.id()) {
      this.state.last_seen_pos = bestEnemy.position();
      this.reset();
    }
  }
}
