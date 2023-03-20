import {
  callback,
  game_object,
  level,
  move,
  patrol,
  time_global,
  XR_flags32,
  XR_game_object,
  XR_patrol,
  XR_vector,
} from "xray16";

import { registry } from "@/engine/core/database";
import { set_state } from "@/engine/core/objects/state/StateManager";
import { abort } from "@/engine/core/utils/debug";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IWaypointData, parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { isStalkerAtWaypoint } from "@/engine/core/utils/position";
import { AnyCallable, AnyObject, LuaArray, Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const dist_walk: number = 10;
const dist_run: number = 2500;
const walk_min_time: number = 3000;
const run_min_time: number = 2000;
const keep_state_min_time: number = 1500;
const default_wait_time: number = 10000;

const default_state_standing: string = "guard";
const default_state_moving1: string = "patrol";
const default_state_moving2: string = "patrol";
const default_state_moving3: string = "patrol";

const arrival_before_rotation: number = 0;
const arrival_after_rotation: number = 1;

const state_none: number = 0;
const state_moving: number = 1;
const state_standing: number = 2;

const sync: LuaTable<string, LuaTable<number, boolean>> = new LuaTable();

/**
 * todo;
 */
export class StalkerMoveManager {
  /**
   * todo;
   */
  public static choose_look_point(
    patrol_look: XR_patrol,
    path_look_info: LuaArray<IWaypointData>,
    search_for: XR_flags32
  ): LuaMultiReturn<[Optional<number>, number]> {
    let this_val;
    let pt_chosen_idx = null;

    let pts_found_total_weight = 0;
    let num_equal_pts = 0;

    for (const look_idx of $range(0, patrol_look.count() - 1)) {
      this_val = path_look_info.get(look_idx).flags;
      if (this_val.equal(search_for)) {
        num_equal_pts = num_equal_pts + 1;

        let point_look_weight: number = path_look_info.get(look_idx)["p"];

        if (point_look_weight !== null) {
          point_look_weight = tonumber(point_look_weight)!;
        } else {
          point_look_weight = 100;
        }

        pts_found_total_weight = pts_found_total_weight + point_look_weight;

        const r = math.random(1, pts_found_total_weight);

        if (r <= point_look_weight) {
          pt_chosen_idx = look_idx;
        }
      }
    }

    return $multi(pt_chosen_idx, num_equal_pts);
  }

  public readonly object: XR_game_object;

  public state: Optional<number> = null;
  public cur_state_moving!: string;
  public cur_state_standing!: string;

  public pt_wait_time: Optional<number> = null;
  public suggested_state!: unknown;
  public syn_signal!: Optional<string>;
  public syn_signal_set_tm!: number;
  public use_default_sound!: boolean;
  public last_look_index!: Optional<number>;

  public patrol_walk: Optional<XR_patrol> = null;
  public path_walk: Optional<string> = null;
  public patrol_look: Optional<XR_patrol> = null;
  public path_look: Optional<string> = null;
  public path_look_info: Optional<LuaTable<number, IWaypointData>> = null;
  public path_walk_info!: LuaTable<number, IWaypointData>;

  public no_validation: Optional<boolean> = null;
  public at_terminal_waypoint_flag: Optional<boolean> = null;
  public current_point_init_time: Optional<number> = null;
  public current_point_index: Optional<number> = null;
  public can_use_get_current_point_index: Optional<boolean> = null;

  public team: Optional<string> = null;

  public last_index: Optional<number> = null;

  public keep_state_until!: number;
  public walk_until!: number;
  public run_until!: number;
  public retval_after_rotation: Optional<number> = null;

  public default_state_standing!: TConditionList;
  public default_state_moving1!: TConditionList;
  public default_state_moving2!: TConditionList;
  public default_state_moving3!: TConditionList;
  public move_cb_info: Optional<{ obj: AnyObject; func: AnyCallable }> = null;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    if (object === null) {
      abort("MoveManager:constructor() - object is null, please update the script");
    }

    this.object = object;
  }

  /**
   * todo;
   */
  public initialize(): StalkerMoveManager {
    this.object.set_callback(callback.patrol_path_in_point, this.waypoint_callback, this as any);

    return this;
  }

  /**
   * todo;
   */
  public reset(
    path_walk: string,
    path_walk_info: LuaArray<IWaypointData>,
    path_look: Optional<string>,
    path_look_info: Optional<LuaArray<IWaypointData>>,
    team: Optional<string>,
    suggested_state: Optional<any>,
    move_cb_info: Optional<{ obj: AnyObject; func: AnyCallable }>,
    no_validation: Optional<boolean>,
    fplaceholder: Optional<any>,
    use_default_sound: Optional<boolean>
  ): void {
    this.pt_wait_time = default_wait_time;
    this.suggested_state = suggested_state;

    const def_state_standing = suggested_state?.standing ? suggested_state.standing : default_state_standing;
    const def_state_moving1 = suggested_state?.moving ? suggested_state.moving : default_state_moving1;
    const def_state_moving2 = suggested_state?.moving ? suggested_state.moving : default_state_moving2;
    const def_state_moving3 = suggested_state?.moving ? suggested_state.moving : default_state_moving3;

    this.default_state_standing = parseConditionsList(def_state_standing);
    this.default_state_moving1 = parseConditionsList(def_state_moving1);
    this.default_state_moving2 = parseConditionsList(def_state_moving2);
    this.default_state_moving3 = parseConditionsList(def_state_moving3);

    this.syn_signal_set_tm = time_global() + 1000;
    this.syn_signal = null;

    this.move_cb_info = move_cb_info;

    if (team !== this.team) {
      this.team = team;

      if (this.team) {
        let state: Optional<LuaTable<number, boolean>> = sync.get(this.team);

        if (!state) {
          state = new LuaTable();
          sync.set(this.team, state);
        }

        state.set(this.object.id(), false);
      }
    }

    if (this.path_walk !== path_walk || this.path_look !== path_look) {
      this.no_validation = no_validation;

      this.path_walk = path_walk;
      this.patrol_walk = new patrol(path_walk);
      if (!this.patrol_walk) {
        abort("object '%s': unable to find path_walk '%s' on the map", this.object.name(), path_walk);
      }

      if (!path_walk_info) {
        abort(
          "object '%s': path_walk ('%s') field was supplied, but path_walk_info field is null",
          this.object.name(),
          path_walk
        );
      }

      this.path_walk_info = path_walk_info!;

      if (path_look !== null) {
        if (!path_look_info) {
          abort(
            "object '%s': path_look ('%s') field was supplied, but path_look_info field is null",
            this.object.name(),
            path_look
          );
        }

        this.patrol_look = new patrol(path_look);
        if (!this.patrol_look) {
          abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), path_look);
        }
      } else {
        this.patrol_look = null;
      }

      this.path_look = path_look;
      this.path_look_info = path_look_info;

      this.at_terminal_waypoint_flag = false;

      this.cur_state_standing = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.default_state_standing as any
      )!;
      this.cur_state_moving = pickSectionFromCondList(registry.actor, this.object, this.default_state_moving1 as any)!;

      this.retval_after_rotation = null;

      this.can_use_get_current_point_index = false;
      this.current_point_index = null;
      this.walk_until = time_global() + walk_min_time;
      this.run_until = time_global() + walk_min_time + run_min_time;
      this.keep_state_until = time_global();

      this.last_index = null;
      this.last_look_index = null;

      this.use_default_sound = use_default_sound!;

      this.object.patrol_path_make_inactual();
    }

    this.setup_movement_by_patrol_path();
  }

  /**
   * todo;
   */
  public continue(): void {
    this.setup_movement_by_patrol_path();
  }

  /**
   * todo;
   */
  public update(): void {
    if (this.syn_signal && time_global() >= this.syn_signal_set_tm) {
      if (this.sync_ok()) {
        this.scheme_set_signal(this.syn_signal);
        this.syn_signal = null;
      }
    }

    if (this.can_use_get_current_point_index && !this.arrived_to_first_waypoint()) {
      const t = time_global();

      if (t >= this.keep_state_until) {
        this.keep_state_until = t + keep_state_min_time;

        const cur_pt = this.current_point_index!;
        const dist = this.object.position().distance_to(this.patrol_walk!.point(cur_pt));

        if (dist <= dist_walk || t < this.walk_until) {
          this.cur_state_moving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.default_state_moving1 as any
          )!;
        } else if (dist <= dist_run || t < this.run_until) {
          this.cur_state_moving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.default_state_moving2 as any
          )!;
        } else {
          this.cur_state_moving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.default_state_moving3 as any
          )!;
        }

        this.update_movement_state();
      }

      return;
    }
  }

  /**
   * todo;
   */
  public arrived_to_first_waypoint() {
    return this.last_index !== null;
  }

  /**
   * todo;
   */
  public update_movement_state(): void {
    set_state(this.object, this.cur_state_moving, null, null, null, null);
  }

  /**
   * todo;
   */
  public update_standing_state(look_pos: XR_vector): void {
    set_state(
      this.object,
      this.cur_state_standing,
      { obj: this, func: this.time_callback, turn_end_func: this.turn_end_callback },
      this.pt_wait_time,
      { look_position: look_pos, look_object: null },
      null
    );
  }

  /**
   * todo;
   */
  public finalize(): void {
    if (this.team) {
      sync.get(this.team).delete(this.object.id());
    }

    this.object.set_path_type(game_object.level_path);
  }

  public setup_movement_by_patrol_path(): void {
    this.object.set_path_type(game_object.patrol_path);
    this.object.set_detail_path_type(move.line);

    if (this.current_point_index) {
      this.object.set_start_point(this.current_point_index);
      this.object.set_patrol_path(this.path_walk!, patrol.next, patrol.continue, true);
    } else {
      this.object.set_patrol_path(this.path_walk!, patrol.nearest, patrol.continue, true);
    }

    this.state = state_moving;

    const [is_term, idx] = this.standing_on_terminal_waypoint();

    if (is_term) {
      this.waypoint_callback(this.object, null, idx);
    } else {
      this.update_movement_state();
    }
  }

  /**
   * todo;
   */
  public standing_on_terminal_waypoint(): LuaMultiReturn<[boolean, Optional<number>]> {
    for (const idx of $range(0, this.patrol_walk!.count() - 1)) {
      if (isStalkerAtWaypoint(this.object, this.patrol_walk!, idx) && this.patrol_walk!.terminal(idx)) {
        return $multi(true, idx);
      }
    }

    return $multi(false, null);
  }

  /**
   * todo;
   */
  public sync_ok(): boolean {
    if (this.team) {
      const state: LuaTable<number, boolean> = sync.get(this.team);

      for (const [id, isFlagged] of state) {
        const obj = level.object_by_id(id);

        if (obj && obj.alive()) {
          if (isFlagged !== true) {
            return false;
          }
        } else {
          sync.get(this.team).delete(id);
        }
      }
    }

    return true;
  }

  /**
   * todo;
   */
  public scheme_set_signal(sig: TName): void {
    const npc_id = this.object.id();
    const stor = registry.objects.get(npc_id);

    if (stor !== null && stor[stor.active_scheme!] !== null) {
      const signals = stor[stor.active_scheme!]!.signals;

      if (signals !== null) {
        signals.set(sig, true);
      }
    }
  }

  /**
   * todo;
   */
  public time_callback(): void {
    const sigtm = this.path_look_info!.get(this.last_look_index!)["sigtm"];

    if (sigtm) {
      this.scheme_set_signal(sigtm);
    }

    if (registry.objects.get(this.object.id()).active_scheme === null) {
      return;
    }

    if (this.last_index && this.patrol_walk!.terminal(this.last_index)) {
      if (isStalkerAtWaypoint(this.object, this.patrol_walk!, this.last_index)) {
        this.waypoint_callback(this.object, null, this.last_index);

        return;
      }

      this.reset(
        this.path_walk!,
        this.path_walk_info,
        this.path_look!,
        this.path_look_info,
        this.team,
        this.suggested_state,
        this.move_cb_info,
        this.no_validation!,
        null,
        null
      );
    } else {
      this.update_movement_state();

      const syn = this.path_look_info!.get(this.last_look_index!)["syn"];

      if (syn) {
        abort(
          "object '%s': path_walk '%s': syn flag used on non-terminal waypoint",
          this.object.name(),
          this.path_walk
        );
      }
    }
  }

  /**
   * todo;
   */
  public turn_end_callback(): void {
    const syn = this.path_look_info!.get(this.last_look_index!)["syn"];

    if (syn) {
      this.syn_signal = this.path_look_info!.get(this.last_look_index!)["sig"];

      if (!this.syn_signal) {
        abort("object '%s': path_look '%s': syn flag uset without sig flag", this.object.name(), this.path_look);
      }

      if (this.team) {
        sync.get(this.team).set(this.object.id(), true);
      }
    } else {
      const sig = this.path_look_info!.get(this.last_look_index!)["sig"];

      if (sig) {
        this.scheme_set_signal(sig);
      } else {
        this.scheme_set_signal("turn_end");
      }
    }

    if (this.retval_after_rotation) {
      if (!this.move_cb_info) {
        abort(
          "object '%s': path_look '%s': ret flag is set, but " +
            "callback function wasn't registered in move_mgr.reset()",
          this.object.name(),
          this.path_look
        );
      }

      set_state(this.object, this.cur_state_standing, null, null, null, null);

      if (!this.move_cb_info) {
        abort(
          "object '%s': path_look '%s': ret flag is set, but " +
            "callback function wasn't registered in move_mgr.reset()",
          this.object.name(),
          this.path_look
        );
      }

      if (
        this.move_cb_info.func(
          this.move_cb_info.obj,
          arrival_after_rotation,
          this.retval_after_rotation,
          this.last_index
        )
      ) {
        return;
      }

      const look_pos = this.patrol_look!.point(this.last_look_index!);

      this.update_standing_state(look_pos);
    }
  }

  /**
   * todo;
   */
  public extrapolate_callback(object: XR_game_object): void {
    this.can_use_get_current_point_index = true;
    this.current_point_init_time = time_global();
    this.current_point_index = this.object.get_current_point_index();
  }

  /**
   * todo;
   */
  public waypoint_callback(obj: XR_game_object, action_type: Optional<number>, index: Optional<number>): void {
    if (index === -1 || index === null) {
      return;
    }

    this.last_index = index;

    if (this.patrol_walk!.terminal(index)) {
      this.at_terminal_waypoint_flag = true;
    }

    const suggested_state_moving = this.path_walk_info.get(index)["a"];

    if (suggested_state_moving) {
      this.cur_state_moving = pickSectionFromCondList(registry.actor, this.object, suggested_state_moving as any)!;
      if (tostring(this.cur_state_moving) === "true") {
        abort("!!!!!");
      }
    } else {
      this.cur_state_moving = pickSectionFromCondList(registry.actor, this.object, this.default_state_moving1 as any)!;
      if (tostring(this.cur_state_moving) === "true") {
        abort("!!!!!");
      }
    }

    const retv = this.path_walk_info.get(index)["ret"];

    if (retv) {
      const retv_num = tonumber(retv);

      if (!this.move_cb_info) {
        abort(
          "object '%s': path_walk '%s': ret flag is set, but " +
            "callback function wasn't registered in move_mgr:reset()",
          this.object.name(),
          this.path_walk
        );
      }

      if (this.move_cb_info.func(this.move_cb_info.obj, arrival_before_rotation, retv_num, index)) {
        return;
      }
    }

    const sig = this.path_walk_info.get(index)["sig"];

    if (sig) {
      this.scheme_set_signal(sig);
    } else if (index === this.path_walk_info.length() - 1) {
      this.scheme_set_signal("path_end");
    }

    const stop_probability = this.path_walk_info.get(index)["p"];

    if (!this.patrol_look || (stop_probability && tonumber(stop_probability)! < math.random(1, 100))) {
      this.update_movement_state();

      return;
    }

    const search_for = this.path_walk_info.get(index).flags;

    if (search_for.get() === 0) {
      this.update_movement_state();

      return;
    }

    const [pt_chosen_idx, num_equal_pts] = StalkerMoveManager.choose_look_point(
      this.patrol_look,
      this.path_look_info!,
      search_for
    );

    if (pt_chosen_idx) {
      const suggested_anim_set: Optional<string> = this.path_look_info!.get(pt_chosen_idx)["a"];

      this.cur_state_standing = pickSectionFromCondList(
        registry.actor,
        this.object,
        suggested_anim_set ? suggested_anim_set : (this.default_state_standing as any)
      )!;

      const suggested_wait_time = this.path_look_info!.get(pt_chosen_idx)["t"];

      if (suggested_wait_time) {
        if (suggested_wait_time === "*") {
          this.pt_wait_time = null;
        } else {
          const tm: number = tonumber(suggested_wait_time)!;

          if (tm !== 0 && (tm < 1000 || tm > 45000)) {
            abort(
              "object '%s': path_look '%s': flag 't':" +
                " incorrect time specified (* or number in interval [1000, 45000] is expected)",
              this.object.name(),
              this.path_look
            );
          }

          this.pt_wait_time = tm;
        }
      } else {
        this.pt_wait_time = default_wait_time;
      }

      const retv = this.path_look_info!.get(pt_chosen_idx)["ret"];

      this.retval_after_rotation = retv ? tonumber(retv)! : null;

      this.last_look_index = pt_chosen_idx;
      this.update_standing_state(this.patrol_look.point(pt_chosen_idx));

      this.state = state_standing;

      this.update();
    } else {
      abort(
        "object '%s': path_walk '%s', index.ts %d: cannot find corresponding point(s) on path_look '%s'",
        this.object.name(),
        tostring(this.path_walk),
        tostring(index),
        tostring(this.path_look)
      );
    }
  }
}
