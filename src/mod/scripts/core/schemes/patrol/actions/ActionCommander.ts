import { action_base, XR_action_base, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { get_state } from "@/mod/scripts/core/state_management/StateManager";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";

export interface IActionCommander extends XR_action_base {
  state: IStoredObject;

  move_mgr: MoveManager;
  was_reset: boolean;
  cur_state: string;
  old_state: Optional<string>;

  activate_scheme(): void;
  deactivate(npc: XR_game_object): void;
  death_callback(npc: XR_game_object): void;
  net_destroy(npc: XR_game_object): void;
  formation_callback(mode: number, number: number, index: number): void;
}

export const ActionCommander: IActionCommander = declare_xr_class("ActionCommander", action_base, {
  __init(npc: XR_game_object, action_name: string, storage: IStoredObject): void {
    action_base.__init(this, null, action_name);

    this.state = storage;
    this.move_mgr = storage[npc.id()].move_mgr;
    this.was_reset = false;
    this.cur_state = "patrol";
  },
  initialize(): void {
    action_base.initialize(this);

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.activate_scheme();
  },
  activate_scheme(): void {
    this.state.signals = {};

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = path_parse_waypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = path_parse_waypoints(this.state.path_look);
    }

    this.move_mgr.reset(
      this.state.path_walk,
      this.state.path_walk_info,
      this.state.path_look,
      this.state.path_look_info,
      this.state.team,
      this.state.suggested_state,
      { obj: this, func: this.formation_callback },
      null,
      null,
      null
    );

    registry.patrols.generic.get(this.state.patrol_key).set_command(this.object, this.cur_state, this.state.formation);
  },
  execute(): void {
    action_base.execute(this);
    this.move_mgr.update();

    const new_state = get_state(this.object)!;
    const old_state = this.old_state;

    if (old_state !== new_state) {
      if (this.state.silent !== true) {
        if (new_state === "sneak") {
          GlobalSound.set_sound_play(this.object.id(), "patrol_sneak", null, null);
        } else if (new_state === "sneak_run") {
          GlobalSound.set_sound_play(this.object.id(), "patrol_run", null, null);
        } else if (new_state === "run") {
          GlobalSound.set_sound_play(this.object.id(), "patrol_run", null, null);
        } else if (new_state === "assault") {
          GlobalSound.set_sound_play(this.object.id(), "patrol_run", null, null);
        } else if (new_state === "rush") {
          GlobalSound.set_sound_play(this.object.id(), "patrol_run", null, null);
        } else {
          if (
            old_state === "sneak" ||
            old_state === "sneak_run" ||
            old_state === "run" ||
            old_state === "assault" ||
            old_state === "rush"
          ) {
            GlobalSound.set_sound_play(this.object.id(), "patrol_walk", null, null);
          }
        }
      }

      this.old_state = new_state;
    }

    registry.patrols.generic.get(this.state.patrol_key).set_command(this.object, new_state, this.state.formation);
  },
  finalize(): void {
    if (this.object.alive() === true) {
      // --printf ("ACTION_COMMANDER:FINALIZE CALLED")
      registry.patrols.generic.get(this.state.patrol_key).set_command(this.object, "guard", this.state.formation);
      this.move_mgr.finalize();
    }

    action_base.finalize(this);
  },
  deactivate(npc: XR_game_object): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(npc);
  },
  death_callback(npc: XR_game_object): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(npc);
  },
  net_destroy(npc: XR_game_object): void {
    this.deactivate(npc);
  },
  formation_callback(mode: number, number: number, index: number): void {
    if (number === 0) {
      this.state.formation = "line";
    } else if (number === 1) {
      this.state.formation = "around";
    } else if (number === 2) {
      this.state.formation = "back";
    }
  },
} as IActionCommander);
