import {
  action_base,
  game_object,
  level,
  move,
  time_global,
  vector,
  XR_action_base,
  XR_game_object,
  XR_vector,
} from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionZombieShoot");

const act_shoot = 1;
const act_danger = 2;

export interface IActionZombieShoot extends XR_action_base {
  st: IStoredObject;
  t: AnyObject;

  was_hit: boolean;
  hit_reaction_end_time: number;
  turn_time: number;
  enemy_last_seen_vid: number;
  valid_path: boolean;
  last_state: Optional<string>;
  last_vid: Optional<number>;

  enemy_last_seen_pos: XR_vector;
  enemy_last_accessible_vid: Optional<number>;
  enemy_last_accessible_position: Optional<XR_vector>;

  calc_random_direction(): XR_vector;
  set_state(state: string, be: Optional<XR_game_object>, pos: Optional<XR_vector>): void;
  hit_callback(
    object: XR_game_object,
    amount: number,
    direction: XR_vector,
    who: XR_game_object,
    bone_id: number
  ): void;
}

export const ActionZombieShoot: IActionZombieShoot = declare_xr_class("ActionZombieShoot", action_base, {
  __init(name: string, storage: IStoredObject): void {
    action_base.__init(this, null, name);
    this.st = storage;
    this.t = {};
    this.was_hit = false;
    this.hit_reaction_end_time = 0;
  },
  initialize(): void {
    action_base.initialize(this);

    // --    this.object:set_node_evaluator      ()
    // --    this.object:set_path_evaluator      ()
    this.object.set_desired_direction();
    this.object.set_detail_path_type(move.line);

    this.last_state = null;

    const bestEnemy = this.object.best_enemy()!;

    this.enemy_last_seen_pos = bestEnemy.position();
    this.enemy_last_seen_vid = bestEnemy.level_vertex_id();
    this.last_vid = null;
    this.valid_path = false;
    this.turn_time = 0;
    this.st.cur_act = act_shoot;

    // --    GlobalSound:set_sound_play(this.object:id(), "fight_enemy")
  },
  execute(): void {
    action_base.execute(this);

    const bestEnemy: Optional<XR_game_object> = this.object.best_enemy()!;
    const see: boolean = this.object.see(bestEnemy);

    if (see) {
      this.enemy_last_seen_pos = bestEnemy.position();
      this.enemy_last_seen_vid = bestEnemy.level_vertex_id();
    }

    if (this.last_vid !== this.enemy_last_seen_vid) {
      this.last_vid = this.enemy_last_seen_vid;
      this.valid_path = false;

      if (!this.object.accessible(this.enemy_last_seen_vid)) {
        this.enemy_last_accessible_vid = this.object.accessible_nearest(
          level.vertex_position(this.enemy_last_seen_vid),
          new vector()
        );
        this.enemy_last_accessible_position = null;
      } else {
        this.enemy_last_accessible_vid = this.enemy_last_seen_vid;
        this.enemy_last_accessible_position = this.enemy_last_seen_pos;
      }
    }

    this.object.set_path_type(game_object.level_path);

    if (this.object.position().distance_to_sqr(this.enemy_last_accessible_position!) > 9) {
      if (this.valid_path === false) {
        this.valid_path = true;
        this.object.set_dest_level_vertex_id(this.enemy_last_accessible_vid!);
      }

      if (see) {
        this.set_state("raid_fire", bestEnemy, null);
      } else if (this.was_hit) {
        this.was_hit = false;
        this.hit_reaction_end_time = time_global() + 5000;

        this.set_state("raid_fire", null, this.enemy_last_seen_pos);
      } else if (this.hit_reaction_end_time > time_global()) {
        // Continue walking
      } else {
        this.set_state("raid", null, this.enemy_last_seen_pos);
      }

      this.turn_time = 0;
    } else {
      // Stank and looking.
      if (see) {
        this.set_state("threat_fire", null, null);
        this.turn_time = 0;
      } else {
        // Randomly searching for enemies.
        if (this.was_hit) {
          this.was_hit = false;
          this.turn_time = time_global() + math.random(5000, 7000);
          this.set_state("threat_na", null, this.enemy_last_seen_pos);
        } else if (this.turn_time < time_global()) {
          this.turn_time = time_global() + math.random(3000, 5000);
          this.set_state("threat_na", null, this.calc_random_direction());
        }
      }
    }
  },
  set_state(state, bestEnemy: Optional<XR_game_object>, position: Optional<XR_vector>): void {
    this.t.look_object = bestEnemy;

    if (bestEnemy) {
      this.t.look_position = this.enemy_last_seen_pos;
    } else {
      this.t.look_position = position;
    }

    set_state(this.object, state, null, null, this.t, null);

    this.last_state = state;
  },
  calc_random_direction(): XR_vector {
    const ang = math.pi * 2 * math.random();
    const look_pos = new vector().set(this.object.position());

    look_pos.x = look_pos.x + math.cos(ang);
    look_pos.z = look_pos.z + math.sin(ang);

    return look_pos;
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

    if (this.st.cur_act === act_shoot) {
      const be = this.object && this.object.best_enemy();

      if (be && who.id() === be.id()) {
        this.enemy_last_seen_pos = be.position();
        this.enemy_last_seen_vid = be.level_vertex_id();
        this.was_hit = true;
      }
    }
  },
} as IActionZombieShoot);
