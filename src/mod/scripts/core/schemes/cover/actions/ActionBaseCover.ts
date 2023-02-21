import { action_base, game_object, level, vector, XR_action_base, XR_game_object, XR_vector } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { get_sim_board, ISimBoard } from "@/mod/scripts/core/database/SimBoard";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { vectorCmp } from "@/mod/scripts/utils/physics";

export interface IActionBaseCover extends XR_action_base {
  state: IStoredObject;
  board: ISimBoard;
  enemy_random_position: XR_vector;

  cover_vertex_id: number;
  cover_position: XR_vector;

  position_reached(): boolean;
  activate_scheme(): void;
}

export const ActionBaseCover: IActionBaseCover = declare_xr_class("ActionBaseCover", action_base, {
  __init(action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);
    this.board = get_sim_board();
  },
  activate_scheme(): void {
    this.state.signals = {};
    this.board = get_sim_board();

    const base_point = this.board.get_smart_by_name(this.state.smart)!.m_level_vertex_id;

    const direction_vector = new vector().set(math.random(-100, 100), 0, math.random(-100, 100));
    const base_vertex_id = level.vertex_in_direction(
      base_point,
      direction_vector,
      math.random(this.state.radius_min, this.state.radius_max)
    );
    const this_random_position = level.vertex_position(base_vertex_id);

    this.enemy_random_position = this_random_position;

    let cover = null;
    const tcover = null;
    let cover_dist = 2;

    while (cover === null && cover_dist <= 4) {
      cover = this.object.best_cover(this_random_position, this.enemy_random_position, cover_dist, 1, 150);
      cover_dist = cover_dist + 1;
    }

    if (cover === null) {
      this.cover_vertex_id = base_vertex_id;
      this.cover_position = this_random_position;
    } else {
      this.cover_vertex_id = cover.level_vertex_id();
      this.cover_position = cover.position();
    }

    if (!this.object.accessible(this.cover_position)) {
      const ttp = new vector().set(0, 0, 0);

      this.cover_vertex_id = this.object.accessible_nearest(this.cover_position, ttp);
      this.cover_position = level.vertex_position(this.cover_vertex_id);
    }

    const desired_direction = new vector().sub(this.cover_position, this.enemy_random_position);

    if (desired_direction !== null && !vectorCmp(desired_direction, new vector().set(0, 0, 0))) {
      desired_direction.normalize();
      this.object.set_desired_direction(desired_direction);
    }

    this.object.set_path_type(game_object.level_path);
    this.object.set_dest_level_vertex_id(this.cover_vertex_id);

    set_state(this.object, "assault", null, null, null, null);
  },
  execute(): void {
    if (this.cover_position.distance_to_sqr(this.object.position()) <= 0.4) {
      const anim = pickSectionFromCondList(registry.actor, this.object, this.state.anim);

      set_state(this.object, anim!, null, null, { look_position: this.enemy_random_position }, null);
    } else {
      this.object.set_dest_level_vertex_id(this.cover_vertex_id);
      set_state(this.object, "assault", null, null, null, null);
    }

    if (this.state.sound_idle !== null) {
      GlobalSound.set_sound_play(this.object.id(), this.state.sound_idle, null, null);
    }

    action_base.execute(this);
  },
  position_reached(): boolean {
    return this.cover_position.distance_to_sqr(this.object.position()) <= 0.4;
  },
} as IActionBaseCover);
