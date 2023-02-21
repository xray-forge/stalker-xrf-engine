import { action_base, device, vector, XR_action_base, XR_game_object, XR_vector } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorRotateY } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ActionLookAround");

export interface IActionLookAround extends XR_action_base {
  state: IStoredObject;

  forget_time: number;
  change_dir_time: number;

  reset(): void;
  hit_callback(
    object: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: string
  ): void;
}

export const ActionLookAround: IActionLookAround = declare_xr_class("ActionLookAround", action_base, {
  __init(name: string, state: IStoredObject): void {
    action_base.__init(this, null, name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);

    this.state.camper_combat_action = true;

    this.reset();
  },
  reset(): void {
    this.forget_time = device().time_global() + 30000;
    this.change_dir_time = device().time_global() + 15000;

    if (!this.state.last_seen_pos && this.object.best_enemy() !== null) {
      this.state.last_seen_pos = this.object.best_enemy()!.position();
    }

    set_state(this.object, "hide", null, null, { look_position: this.state.last_seen_pos }, null);
  },
  execute(): void {
    action_base.execute(this);

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

      set_state(this.object, "hide", null, null, { look_position: this.object.position().add(dir) }, null);
    }
  },
  finalize(): void {
    action_base.finalize(this);

    this.state.last_seen_pos = null;

    this.state.camper_combat_action = false;
  },
  hit_callback(
    object: XR_game_object,
    amount: number,
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
  },
} as IActionLookAround);
