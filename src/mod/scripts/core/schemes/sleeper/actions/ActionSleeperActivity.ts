import { action_base, patrol, XR_action_base, XR_game_object } from "xray16";

import { AnyCallable, Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { path_parse_waypoints_from_arglist } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSleeperActivity");

const state_walking = 0;
const state_sleeping = 1;

export interface IActionSleeperActivity extends XR_action_base {
  state: IStoredObject;
  move_mgr: MoveManager;
  was_reset: boolean;
  sleeping_state: number;

  timer: {
    begin: Optional<number>;
    idle: Optional<number>;
    maxidle: number;
    sumidle: number;
    random: number;
  };

  reset_scheme(): void;
  activate_scheme(): void;
  callback(mode: unknown, number: number): boolean;
}

export const ActionSleeperActivity: IActionSleeperActivity = declare_xr_class("ActionSleeperActivity", action_base, {
  __init(npc: XR_game_object, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;

    this.move_mgr = storage.get(npc.id()).move_mgr;
    this.was_reset = false;
  },
  initialize(): void {
    action_base.initialize(this);

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.reset_scheme();
  },
  reset_scheme(): void {
    this.timer = {
      begin: null,
      idle: null,
      maxidle: 10,
      sumidle: 20,
      random: 50,
    };

    this.state.signals = {};
    this.sleeping_state = state_walking;

    if (this.state.path_walk_info === null) {
      const patrol_main = new patrol(this.state.path_main);

      if (!patrol_main) {
        abort("object '%s': unable to find path_main '%s' on the map", this.object.name(), this.state.path_main);
      }

      const num_wayp = patrol_main.count();

      if (num_wayp === 1) {
        this.state.path_walk = this.state.path_main;
        this.state.path_walk_info = path_parse_waypoints_from_arglist(this.state.path_main, 1, [0, "wp00|ret=1"]);
        this.state.path_look = null;
        this.state.path_look_info = null;
      } else if (num_wayp === 2) {
        this.state.path_walk = this.state.path_main;
        this.state.path_walk_info = path_parse_waypoints_from_arglist(
          this.state.path_main,
          2,
          [1, "wp00"],
          [0, "wp01"]
        );
        this.state.path_look = this.state.path_main;
        this.state.path_look_info = path_parse_waypoints_from_arglist(
          this.state.path_main,
          2,
          [0, "wp00"],
          [1, "wp01|ret=1"]
        );
      } else {
        abort(
          "object '%s': path_main '%s' contains %d waypoints, while 1 or 2 were expected",
          this.object.name(),
          this.state.path_main,
          num_wayp
        );
      }
    }

    this.move_mgr.reset(
      this.state.path_walk,
      this.state.path_walk_info,
      this.state.path_look,
      this.state.path_look_info,
      null,
      null,
      // todo: Unsafe this casting, should be avoided later with updates
      { obj: this, func: this.callback as unknown as AnyCallable },
      true,
      null,
      null
    );
    this.was_reset = true;
  },
  activate_scheme(): void {
    this.was_reset = false;
  },
  callback(mode, number: number): boolean {
    this.sleeping_state = state_sleeping;

    const sleepPatrol = new patrol(this.state.path_main);
    const position = sleepPatrol.count() === 2 ? sleepPatrol.point(1) : null;

    if (this.state.wakeable) {
      set_state(this.object, "sit", null, null, { look_position: position }, null);
    } else {
      set_state(this.object, "sleep", null, null, { look_position: position }, null);
    }

    return true;
  },
  execute(): void {
    action_base.execute(this);
    if (!this.was_reset) {
      this.reset_scheme();
    }

    if (this.sleeping_state === state_walking) {
      this.move_mgr.update();

      return;
    }

    /*
     *  if this.state == state_sleeping then
     *    --        GlobalSound:set_sound(this.object, "sleep")
     *  end
     */
  },
  finalize(): void {
    // --  GlobalSound:set_sound(this.object, null)
    this.move_mgr.finalize();
    action_base.finalize(this);
  },
} as IActionSleeperActivity);
