import { action_base, alife, hit, time_global, XR_action_base, XR_alife_simulator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionWounded");

export interface IActionWounded extends XR_action_base {
  a: IStoredObject;
}

export const ActionWounded: IActionWounded = declare_xr_class("ActionWounded", action_base, {
  __init(name: string, storage: IStoredObject): void {
    action_base.__init(this, null, name);
    this.a = storage;
  },
  initialize(): void {
    action_base.initialize(this);

    this.object.set_desired_position();
    this.object.set_desired_direction();

    if (this.a.help_start_dialog) {
      this.object.set_start_dialog(this.a.help_start_dialog);
    }

    this.object.movement_enabled(false);
    this.object.disable_trade();
    this.object.wounded(true);
  },
  execute(): void {
    log.info("Execute:", this.object.name());

    action_base.execute(this);

    const wound_manager = this.a.wound_manager;
    const wound_manager_victim = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(
      this.object,
      "wounded_victim"
    );

    const sim: XR_alife_simulator = alife();

    if (this.a.autoheal === true) {
      if (wound_manager.can_use_medkit !== true) {
        const begin_wounded = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(this.object, "begin_wounded");
        const current_time = time_global();

        if (begin_wounded === null) {
          get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "begin_wounded", current_time);
        } else if (current_time - begin_wounded > 60000) {
          const npc = this.object;

          sim.create("medkit_script", npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
          wound_manager.unlock_medkit();
        }
      }
    }

    const wound_manager_state = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(this.object, "wounded_state");
    const wound_manager_sound = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(this.object, "wounded_sound");

    if (wound_manager_state === "true") {
      const h = new hit();

      h.power = 0;
      h.direction = this.object.direction();
      h.bone("bip01_spine");
      h.draftsman = getActor();
      h.impulse = 0;
      h.type = hit.wound;
      this.object.hit(h);
    } else {
      if (this.a.use_medkit === true) {
        wound_manager.eat_medkit();
      }

      if (tostring(wound_manager_state) === "nil") {
        abort("Wrong wounded animation %s", this.object.name());
      }

      // todo: Here should be victim
      set_state(this.object, wound_manager_state, null, null, { look_object: null }, null);
    }

    if (wound_manager_sound === "nil") {
      GlobalSound.set_sound_play(this.object.id(), null, null, null);
    } else {
      GlobalSound.set_sound_play(this.object.id(), wound_manager_sound, null, null);
    }
  },
  finalize(): void {
    action_base.finalize(this);

    this.object.enable_trade();
    this.object.disable_talk();
    // -- GlobalSound:set_sound(this.object, nil)
    this.object.wounded(false);
    this.object.movement_enabled(true);
  }
} as IActionWounded);
