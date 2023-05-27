import { callback, game_object, level, move, patrol, time_global } from "xray16";

import { IRegistryObjectState, registry, setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state/types";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IWaypointData, parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { isStalkerAtWaypoint } from "@/engine/core/utils/position";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  ClientObject,
  Flags32,
  LuaArray,
  Optional,
  Patrol,
  TDistance,
  TDuration,
  TIndex,
  TName,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const dist_walk: TDistance = 10;
const dist_run: TDistance = 2500;
const walk_min_time: TDuration = 3000;
const run_min_time: TDuration = 2000;
const keep_state_min_time: TDuration = 1500;
const default_wait_time: TDuration = 10000;

const default_state_standing: EStalkerState = EStalkerState.GUARD;
const default_state_moving1: EStalkerState = EStalkerState.PATROL;
const default_state_moving2: EStalkerState = EStalkerState.PATROL;
const default_state_moving3: EStalkerState = EStalkerState.PATROL;

const arrival_before_rotation: number = 0;
const arrival_after_rotation: number = 1;

enum ECurrentState {
  NONE = 0,
  MOVING = 1,
  STANDING = 2,
}

const sync: LuaTable<string, LuaTable<number, boolean>> = new LuaTable();

/**
 * todo;
 */
export class StalkerMoveManager {
  /**
   * todo: Description.
   */
  public static chooseLookPoint(
    patrol_look: Patrol,
    path_look_info: LuaArray<IWaypointData>,
    search_for: Flags32
  ): LuaMultiReturn<[Optional<number>, number]> {
    let this_val;
    let pt_chosen_idx: Optional<TIndex> = null;

    let pts_found_total_weight = 0;
    let num_equal_pts = 0;

    for (const lookIndex of $range(0, patrol_look.count() - 1)) {
      this_val = path_look_info.get(lookIndex).flags;
      if (this_val.equal(search_for)) {
        num_equal_pts = num_equal_pts + 1;

        const probabilityRaw = path_look_info.get(lookIndex)["p"];
        const pointLookWeight: number = probabilityRaw === null ? 100 : (tonumber(probabilityRaw) as number);

        pts_found_total_weight = pts_found_total_weight + pointLookWeight;

        const r = math.random(1, pts_found_total_weight);

        if (r <= pointLookWeight) {
          pt_chosen_idx = lookIndex;
        }
      }
    }

    return $multi(pt_chosen_idx, num_equal_pts);
  }

  public readonly object: ClientObject;

  public state: Optional<ECurrentState> = null;
  public currentStateMoving!: EStalkerState;
  public currentStateStanding!: EStalkerState;

  public pt_wait_time: Optional<number> = null;
  public suggested_state!: unknown;
  public syn_signal!: Optional<string>;
  public syn_signal_set_tm!: number;
  public use_default_sound!: boolean;
  public last_look_index!: Optional<number>;

  public patrol_walk: Optional<Patrol> = null;
  public path_walk: Optional<string> = null;
  public patrol_look: Optional<Patrol> = null;
  public path_look: Optional<string> = null;
  public path_look_info: Optional<LuaTable<number, IWaypointData>> = null;
  public path_walk_info!: LuaTable<number, IWaypointData>;

  public no_validation: Optional<boolean> = null;
  public isOnTerminalWaypoint: Optional<boolean> = null;
  public current_point_init_time: Optional<number> = null;
  public current_point_index: Optional<TIndex> = null;
  public can_use_get_current_point_index: Optional<boolean> = null;

  public team: Optional<string> = null;

  public lastIndex: Optional<TIndex> = null;

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
   * todo: Description.
   */
  public constructor(object: ClientObject) {
    this.object = object;
  }

  /**
   * todo: Description.
   */
  public initialize(): StalkerMoveManager {
    this.object.set_callback(callback.patrol_path_in_point, this.waypoint_callback, this as any);

    return this;
  }

  /**
   * todo: Description.
   */
  public reset(
    walkPath: string,
    walkPathInfo: LuaArray<IWaypointData>,
    lookPath: Optional<string>,
    lookPathInfo: Optional<LuaArray<IWaypointData>>,
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

    if (this.path_walk !== walkPath || this.path_look !== lookPath) {
      this.no_validation = no_validation;

      this.path_walk = walkPath;
      this.patrol_walk = new patrol(walkPath);
      if (!this.patrol_walk) {
        abort("object '%s': unable to find path_walk '%s' on the map", this.object.name(), walkPath);
      }

      if (!walkPathInfo) {
        abort(
          "object '%s': path_walk ('%s') field was supplied, but path_walk_info field is null",
          this.object.name(),
          walkPath
        );
      }

      this.path_walk_info = walkPathInfo!;

      if (lookPath !== null) {
        if (!lookPathInfo) {
          abort(
            "object '%s': path_look ('%s') field was supplied, but path_look_info field is null",
            this.object.name(),
            lookPath
          );
        }

        this.patrol_look = new patrol(lookPath);
        if (!this.patrol_look) {
          abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), lookPath);
        }
      } else {
        this.patrol_look = null;
      }

      this.path_look = lookPath;
      this.path_look_info = lookPathInfo;

      this.isOnTerminalWaypoint = false;

      this.currentStateStanding = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.default_state_standing as any
      )!;
      this.currentStateMoving = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.default_state_moving1 as any
      )!;

      this.retval_after_rotation = null;

      this.can_use_get_current_point_index = false;
      this.current_point_index = null;
      this.walk_until = time_global() + walk_min_time;
      this.run_until = time_global() + walk_min_time + run_min_time;
      this.keep_state_until = time_global();

      this.lastIndex = null;
      this.last_look_index = null;

      this.use_default_sound = use_default_sound!;

      this.object.patrol_path_make_inactual();
    }

    this.setupMovementByPatrolPath();
  }

  /**
   * todo: Description.
   */
  public continue(): void {
    this.setupMovementByPatrolPath();
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.syn_signal && time_global() >= this.syn_signal_set_tm) {
      if (this.isSynchronized()) {
        this.setActiveSchemeSignal(this.syn_signal);
        this.syn_signal = null;
      }
    }

    if (this.can_use_get_current_point_index && !this.isArrivedToFirstWaypoint()) {
      const t = time_global();

      if (t >= this.keep_state_until) {
        this.keep_state_until = t + keep_state_min_time;

        const currentPointIndex: TIndex = this.current_point_index!;
        const dist = this.object.position().distance_to(this.patrol_walk!.point(currentPointIndex));

        if (dist <= dist_walk || t < this.walk_until) {
          this.currentStateMoving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.default_state_moving1 as any
          )!;
        } else if (dist <= dist_run || t < this.run_until) {
          this.currentStateMoving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.default_state_moving2 as any
          )!;
        } else {
          this.currentStateMoving = pickSectionFromCondList(
            registry.actor,
            this.object,
            this.default_state_moving3 as any
          )!;
        }

        this.updateMovementState();
      }

      return;
    }
  }

  /**
   * todo: Description.
   */
  public isArrivedToFirstWaypoint(): boolean {
    return this.lastIndex !== null;
  }

  /**
   * todo: Description.
   */
  public updateMovementState(): void {
    setStalkerState(this.object, this.currentStateMoving);
  }

  /**
   * todo: Description.
   */
  public updateStandingState(lookPosition: Vector): void {
    setStalkerState(
      this.object,
      this.currentStateStanding,
      { context: this, callback: this.onAnimationUpdate, turnEndCallback: this.onAnimationTurnEnd },
      this.pt_wait_time,
      { look_position: lookPosition, look_object: null },
      null
    );
  }

  /**
   * todo: Description.
   */
  public finalize(): void {
    if (this.team) {
      sync.get(this.team).delete(this.object.id());
    }

    this.object.set_path_type(game_object.level_path);
  }

  /**
   * todo: Description.
   */
  public setupMovementByPatrolPath(): void {
    this.object.set_path_type(game_object.patrol_path);
    this.object.set_detail_path_type(move.line);

    if (this.current_point_index) {
      this.object.set_start_point(this.current_point_index);
      this.object.set_patrol_path(this.path_walk!, patrol.next, patrol.continue, true);
    } else {
      this.object.set_patrol_path(this.path_walk!, patrol.nearest, patrol.continue, true);
    }

    this.state = ECurrentState.MOVING;

    const [isTerminalPoint, index] = this.isStandingOnTerminalWaypoint();

    if (isTerminalPoint) {
      this.waypoint_callback(this.object, null, index);
    } else {
      this.updateMovementState();
    }
  }

  /**
   * todo: Description.
   */
  public isStandingOnTerminalWaypoint(): LuaMultiReturn<[boolean, Optional<TIndex>]> {
    for (const idx of $range(0, this.patrol_walk!.count() - 1)) {
      if (isStalkerAtWaypoint(this.object, this.patrol_walk!, idx) && this.patrol_walk!.terminal(idx)) {
        return $multi(true, idx);
      }
    }

    return $multi(false, null);
  }

  /**
   * todo: Description.
   */
  public isSynchronized(): boolean {
    if (this.team) {
      const state: LuaTable<number, boolean> = sync.get(this.team);

      for (const [id, isFlagged] of state) {
        const object: Optional<ClientObject> = level.object_by_id(id);

        if (object?.alive()) {
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
   * todo: Description.
   */
  public setActiveSchemeSignal(signal: TName): void {
    const state: IRegistryObjectState = registry.objects.get(this.object.id());

    if (state !== null && state[state.active_scheme!] !== null) {
      const signals: Optional<LuaTable<TName, boolean>> = state[state.active_scheme!]!.signals;

      if (signals !== null) {
        signals.set(signal, true);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onAnimationUpdate(): void {
    const sigtm: Optional<TName> = this.path_look_info!.get(this.last_look_index!)["sigtm"] as Optional<TName>;

    if (sigtm) {
      this.setActiveSchemeSignal(sigtm);
    }

    if (registry.objects.get(this.object.id()).active_scheme === null) {
      return;
    }

    if (this.lastIndex && this.patrol_walk!.terminal(this.lastIndex)) {
      if (isStalkerAtWaypoint(this.object, this.patrol_walk!, this.lastIndex)) {
        this.waypoint_callback(this.object, null, this.lastIndex);

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
      this.updateMovementState();

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
   * todo: Description.
   */
  public onAnimationTurnEnd(): void {
    const syn = this.path_look_info!.get(this.last_look_index!)["syn"];

    if (syn) {
      this.syn_signal = this.path_look_info!.get(this.last_look_index!)["sig"] as string;

      if (!this.syn_signal) {
        abort("object '%s': path_look '%s': syn flag uset without sig flag", this.object.name(), this.path_look);
      }

      if (this.team) {
        sync.get(this.team).set(this.object.id(), true);
      }
    } else {
      const sig = this.path_look_info!.get(this.last_look_index!)["sig"];

      if (sig) {
        this.setActiveSchemeSignal(sig);
      } else {
        this.setActiveSchemeSignal("turn_end");
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

      setStalkerState(this.object, this.currentStateStanding, null, null, null, null);

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
          this.lastIndex
        )
      ) {
        return;
      }

      this.updateStandingState(this.patrol_look!.point(this.last_look_index!));
    }
  }

  /**
   * todo: Description.
   */
  public extrapolate_callback(object: ClientObject): void {
    this.can_use_get_current_point_index = true;
    this.current_point_init_time = time_global();
    this.current_point_index = this.object.get_current_point_index();
  }

  /**
   * todo: Description.
   */
  public waypoint_callback(object: ClientObject, actionType: Optional<number>, index: Optional<TIndex>): void {
    if (index === -1 || index === null) {
      return;
    }

    this.lastIndex = index;

    if (this.patrol_walk!.terminal(index)) {
      this.isOnTerminalWaypoint = true;
    }

    const suggested_state_moving = this.path_walk_info.get(index)["a"];

    if (suggested_state_moving) {
      this.currentStateMoving = pickSectionFromCondList(registry.actor, this.object, suggested_state_moving as any)!;
      if (tostring(this.currentStateMoving) === TRUE) {
        abort("!!!!!");
      }
    } else {
      this.currentStateMoving = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.default_state_moving1 as any
      )!;
      if (tostring(this.currentStateMoving) === TRUE) {
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
      this.setActiveSchemeSignal(sig);
    } else if (index === this.path_walk_info.length() - 1) {
      this.setActiveSchemeSignal("path_end");
    }

    const stopProbability = this.path_walk_info.get(index)["p"];

    if (!this.patrol_look || (stopProbability && tonumber(stopProbability)! < math.random(1, 100))) {
      this.updateMovementState();

      return;
    }

    const search_for = this.path_walk_info.get(index).flags;

    if (search_for.get() === 0) {
      this.updateMovementState();

      return;
    }

    const [pt_chosen_idx, num_equal_pts] = StalkerMoveManager.chooseLookPoint(
      this.patrol_look,
      this.path_look_info!,
      search_for
    );

    if (pt_chosen_idx) {
      const suggested_anim_set: Optional<string> = this.path_look_info!.get(pt_chosen_idx)["a"];

      this.currentStateStanding = pickSectionFromCondList(
        registry.actor,
        this.object,
        suggested_anim_set ? suggested_anim_set : (this.default_state_standing as any)
      )!;

      const suggestedWaitTime = this.path_look_info!.get(pt_chosen_idx)["t"];

      if (suggestedWaitTime) {
        if (suggestedWaitTime === "*") {
          this.pt_wait_time = null;
        } else {
          const tm: number = tonumber(suggestedWaitTime)!;

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
      this.updateStandingState(this.patrol_look.point(pt_chosen_idx));

      this.state = ECurrentState.STANDING;

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
