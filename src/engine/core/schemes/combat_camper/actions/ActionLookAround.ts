import { action_base, device, LuabindClass, vector, XR_game_object, XR_vector } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorRotateY } from "@/engine/core/utils/vector";
import { Optional, TCount, TRate, TTimestamp } from "@/engine/lib/types";

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

    this.state.camper_combat_action = true;

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
      { look_position: this.state.last_seen_pos, look_object: null },
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

      let direction: XR_vector = new vector().set(this.state.last_seen_pos).sub(this.object.position());

      direction = vectorRotateY(direction, angle);

      setStalkerState(
        this.object,
        EStalkerState.HIDE,
        null,
        null,
        { look_position: this.object.position().add(direction), look_object: null },
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
    this.state.camper_combat_action = false;
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: string
  ): void {
    if (who === null || !this.state.camper_combat_action) {
      return;
    }

    const bestEnemy: Optional<XR_game_object> = this.object?.best_enemy();

    if (bestEnemy && who.id() === bestEnemy.id()) {
      this.state.last_seen_pos = bestEnemy.position();
      this.reset();
    }
  }
}
