import { action_base, game_object, time_global, vector, XR_action_base, XR_game_object, XR_vector } from "xray16";

import { IStoredObject, patrols } from "@/mod/scripts/core/db";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { send_to_nearest_accessible_vertex } from "@/mod/scripts/utils/alife";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ActionPatrol");

export interface IActionPatrol extends XR_action_base {
  state: IStoredObject;

  move_mgr: MoveManager;
  l_vid: number;
  dist: number;
  dir: XR_vector;
  cur_state: string;
  on_point: boolean;
  was_reset: boolean;
  time_to_update: number;

  activate_scheme(): void;
  formation_callback(mode: number, number: number, index: number): void;
  death_callback(npc: XR_game_object): void;
  deactivate(npc: XR_game_object): void;
  net_destroy(npc: XR_game_object): void;
}

export const ActionPatrol: IActionPatrol = declare_xr_class("ActionPatrol", action_base, {
  __init(npc: XR_game_object, action_name: string, storage: IStoredObject): void {
    action_base.__init(this, null, action_name);

    this.state = storage;
    this.move_mgr = storage[npc.id()].move_mgr;
    this.l_vid = -1;
    this.dist = 0;
    this.dir = new vector().set(0, 0, 1);
    this.cur_state = "patrol";
    this.on_point = false;
    this.was_reset = false;
    this.time_to_update = time_global() + 1000;
  },
  initialize(): void {
    action_base.initialize(this);

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.on_point = false;
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
  },
  execute(): void {
    action_base.execute(this);

    if (this.time_to_update - time_global() > 0) {
      return;
    }

    this.time_to_update = time_global() + 1000;

    const [l_vid, dir, cur_state] = patrols.get(this.state.patrol_key).get_npc_command(this.object);

    this.l_vid = l_vid;
    this.dir = dir;
    this.cur_state = cur_state;

    this.l_vid = send_to_nearest_accessible_vertex(this.object, this.l_vid);

    const desired_direction = this.dir;

    if (desired_direction !== null && !vectorCmp(desired_direction, new vector().set(0, 0, 0))) {
      desired_direction.normalize();
      this.object.set_desired_direction(desired_direction);
    }

    this.object.set_path_type(game_object.level_path);

    set_state(this.object, this.cur_state, null, null, null, null);
  },
  finalize(): void {
    if (this.object.alive()) {
      this.move_mgr.finalize();
    }

    action_base.finalize(this);
  },
  formation_callback(mode: number, number: number, index: number): void {},
  death_callback(npc: XR_game_object): void {
    patrols.get(this.state.patrol_key).remove_npc(npc);
  },
  deactivate(npc: XR_game_object): void {
    patrols.get(this.state.patrol_key).remove_npc(npc);
  },
  net_destroy(npc: XR_game_object): void {
    this.deactivate(npc);
  },
} as IActionPatrol);
