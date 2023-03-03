import { action_base, game_object, time_global, vector, XR_game_object, XR_vector } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { StalkerMoveManager } from "@/mod/scripts/core/state_management/StalkerMoveManager";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { sendToNearestAccessibleVertex } from "@/mod/scripts/utils/alife";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ActionPatrol");

/**
 * todo;
 */
@LuabindClass()
export class ActionPatrol extends action_base {
  public readonly state: IStoredObject;
  public readonly moveManager: StalkerMoveManager;

  public l_vid: number = -1;
  public dist: number = 0;
  public dir: XR_vector = new vector().set(0, 0, 1);
  public cur_state: string = "cur_state";
  public on_point: boolean = false;
  public time_to_update: number = time_global() + 1000;

  public constructor(storage: IStoredObject, object: XR_game_object) {
    super(null, ActionPatrol.__name);

    this.state = storage;
    this.moveManager = storage[object.id()].move;
  }

  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.on_point = false;
  }

  public activate_scheme(): void {
    this.state.signals = {};

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = path_parse_waypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = path_parse_waypoints(this.state.path_look);
    }

    this.moveManager.reset(
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
  }

  public override execute(): void {
    super.execute();

    if (this.time_to_update - time_global() > 0) {
      return;
    }

    this.time_to_update = time_global() + 1000;

    const [l_vid, dir, cur_state] = registry.patrols.generic.get(this.state.patrol_key).get_npc_command(this.object);

    this.l_vid = l_vid;
    this.dir = dir;
    this.cur_state = cur_state;

    this.l_vid = sendToNearestAccessibleVertex(this.object, this.l_vid);

    const desired_direction = this.dir;

    if (desired_direction !== null && !vectorCmp(desired_direction, new vector().set(0, 0, 0))) {
      desired_direction.normalize();
      this.object.set_desired_direction(desired_direction);
    }

    this.object.set_path_type(game_object.level_path);

    set_state(this.object, this.cur_state, null, null, null, null);
  }

  public override finalize(): void {
    if (this.object.alive()) {
      this.moveManager.finalize();
    }

    super.finalize();
  }

  public formation_callback(mode: number, number: number, index: number): void {}

  public death_callback(npc: XR_game_object): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(npc);
  }

  public deactivate(npc: XR_game_object): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(npc);
  }

  public net_destroy(npc: XR_game_object): void {
    this.deactivate(npc);
  }
}
