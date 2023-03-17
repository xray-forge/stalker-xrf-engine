import { action_base, device, LuabindClass, vector, XR_game_object, XR_vector } from "xray16";

import { TCount, TTimestamp } from "@/mod/lib/types";
import { ISchemeCombatState } from "@/mod/scripts/core/schemes/combat";
import { set_state } from "@/mod/scripts/core/objects/state/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorRotateY } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionLookAround extends action_base {
  public readonly state: ISchemeCombatState;
  public forget_time: TTimestamp = 0;
  public change_dir_time: TTimestamp = 0;

  /**
   * todo;
   */
  public constructor(state: ISchemeCombatState) {
    super(null, ActionLookAround.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.state.camper_combat_action = true;

    this.reset();
  }

  /**
   * todo;
   */
  public reset(): void {
    this.forget_time = device().time_global() + 30_000;
    this.change_dir_time = device().time_global() + 15_000;

    if (!this.state.last_seen_pos && this.object.best_enemy() !== null) {
      this.state.last_seen_pos = this.object.best_enemy()!.position();
    }

    set_state(this.object, "hide", null, null, { look_position: this.state.last_seen_pos, look_object: null }, null);
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();

    if (this.forget_time < device().time_global()) {
      // --        this.object:enable_memory_object( this.object:best_enemy(), false )
      this.state.last_seen_pos = null;

      return;
    }

    if (this.change_dir_time < device().time_global()) {
      this.change_dir_time = device().time_global() + math.random(2000, 4000);

      const ang = math.random(0, 120) - 60;

      if (this.state.last_seen_pos === null) {
        abort("report this error to STALKER-829 bug [%s]", this.object.name());
      }

      let dir = new vector().set(this.state.last_seen_pos).sub(this.object.position());

      dir = vectorRotateY(dir, ang);

      set_state(
        this.object,
        "hide",
        null,
        null,
        { look_position: this.object.position().add(dir), look_object: null },
        null
      );
    }
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();

    this.state.last_seen_pos = null;
    this.state.camper_combat_action = false;
  }

  /**
   * todo;
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

    const be = this.object && this.object.best_enemy();

    if (be && who.id() === be.id()) {
      this.state.last_seen_pos = be.position();
      this.reset();
    }
  }
}
