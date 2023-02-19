import { action_base, game_object, level, patrol, vector, XR_action_base } from "xray16";

import { IStoredObject, kamps } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ActionGoPosition");

export interface IActionGoPosition extends XR_action_base {
  state: IStoredObject;
}

export const ActionGoPosition: IActionGoPosition = declare_xr_class("ActionGoPosition", action_base, {
  __init(npc_name: string, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);

    // --    this.object.set_node_evaluator()
    // --    this.object.set_path_evaluator()
    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.state.pos_vertex = null;
    this.state.npc_position_num = null;
    this.state.signals = {};
  },
  execute(): void {
    action_base.execute(this);

    const [tmp_pos_vertex, npc_position_num] = kamps
      .get(this.state.center_point)
      .getDestVertex(this.object, this.state.radius);

    if (this.state.npc_position_num !== npc_position_num) {
      this.state.npc_position_num = npc_position_num;
      this.state.pos_vertex = tmp_pos_vertex;

      this.state.pp = new patrol(this.state.center_point).point(0);

      const dir = new vector().set(math.random(-1, 1), 0, math.random(-1, 1));

      dir.normalize();

      const delta_dist = math.random(0, 0.5);

      this.state.pp.x = this.state.pp.x + dir.x * delta_dist;
      this.state.pp.z = this.state.pp.z + dir.z * delta_dist;

      this.object.set_dest_level_vertex_id(this.state.pos_vertex);

      const desired_direction = new vector().sub(this.state.pp, level.vertex_position(this.state.pos_vertex));

      if (desired_direction !== null && !vectorCmp(desired_direction, new vector().set(0, 0, 0))) {
        desired_direction.normalize();
        this.object.set_desired_direction(desired_direction);
      }

      this.object.set_path_type(game_object.level_path);
      set_state(this.object, this.state.def_state_moving, null, null, null, null);
    }
  },
} as IActionGoPosition);
