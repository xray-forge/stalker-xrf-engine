import {
  action_base,
  danger_object,
  game_object,
  move,
  time_global,
  XR_action_base,
  XR_game_object,
  XR_vector,
} from "xray16";

import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionZombieGoToDanger");

const act_shoot = 1;
const act_danger = 2;

export interface IActionZombieGoToDanger extends XR_action_base {
  st: IStoredObject;
  t: AnyObject;

  was_hit: boolean;
  hit_reaction_end_time: number;

  last_state: Optional<string>;
  bdo_vert_id: Optional<number>;
  last_sent_vert_id: Optional<number>;
  bdo_id: Optional<number>;

  enemy_last_seen_pos: Optional<XR_vector>;
  enemy_last_seen_vid: Optional<number>;

  set_state(state: string, be: Optional<XR_game_object>, pos: Optional<XR_vector>): void;
  hit_callback(
    object: XR_game_object,
    amount: number,
    direction: XR_vector,
    who: XR_game_object,
    bone_id: number
  ): void;
}

export const ActionZombieGoToDanger: IActionZombieGoToDanger = declare_xr_class("ActionZombieGoToDanger", action_base, {
  __init(name: string, state: IStoredObject): void {
    action_base.__init(this, null, name);
    this.st = state;
    this.t = {};
    this.was_hit = false;
    this.hit_reaction_end_time = 0;
  },
  initialize(): void {
    action_base.initialize(this);
    // --    this.object.set_node_evaluator      ()
    // --    this.object.set_path_evaluator      ()
    this.object.set_desired_direction();
    this.object.set_detail_path_type(move.line);
    this.object.set_path_type(game_object.level_path);
    this.last_state = null;
    this.bdo_id = null;
    this.bdo_vert_id = null;
    this.last_sent_vert_id = null;
    this.st.cur_act = act_danger;
  },
  set_state(state, be, pos): void {
    if (state !== this.last_state) {
      this.t.look_object = be;
      this.t.look_position = pos;
      set_state(this.object, state, null, null, this.t, null);
      this.last_state = state;
    }
  },
  execute(): void {
    action_base.execute(this);

    if (this.was_hit) {
      this.was_hit = false;
      this.hit_reaction_end_time = time_global() + 5000;
      this.set_state("raid_fire", null, this.enemy_last_seen_pos);
    } else if (this.hit_reaction_end_time > time_global()) {
      // -- ���������� ���� � �������� � �����, �� ������� ��� ������ ���
    } else {
      const bd = this.object.best_danger()!;
      const bdo = bd.object();

      if (bdo && bd.type() !== danger_object.grenade) {
        if (!this.bdo_id || this.bdo_id !== bdo.id()) {
          this.bdo_id = bdo.id();
          this.bdo_vert_id = bdo.level_vertex_id();
        }

        if (this.bdo_vert_id !== this.last_sent_vert_id) {
          this.last_sent_vert_id = this.bdo_vert_id;
          get_global<AnyCallablesModule>("utils").send_to_nearest_accessible_vertex(this.object, this.bdo_vert_id);
        }

        this.set_state("raid", null, bd.position());
      } else {
        this.set_state("threat_na", null, bd.position());
      }
    }
  },
  finalize(): void {
    action_base.finalize(this);
    this.st.cur_act = null;
  },
  hit_callback(
    object: XR_game_object,
    amount: number,
    direction: XR_vector,
    who: XR_game_object,
    bone_id: number
  ): void {
    if (who === null) {
      return;
    }

    if (this.st.cur_act === act_danger) {
      const bd = this.object.best_danger();

      if (bd) {
        const bdo = bd.object();

        if (bdo !== null && (bd.type() === danger_object.attacked || amount > 0)) {
          this.enemy_last_seen_pos = bdo.position();
          this.enemy_last_seen_vid = bdo.level_vertex_id();
          this.was_hit = true;
        }
      }
    }
  },
} as IActionZombieGoToDanger);
