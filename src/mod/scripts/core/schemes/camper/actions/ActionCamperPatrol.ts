import {
  action_base,
  danger_object,
  LuabindClass,
  patrol,
  stalker_ids,
  time_global,
  vector,
  XR_game_object,
  XR_vector,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { ICampPoint, ISchemeCamperState } from "@/mod/scripts/core/schemes/camper/ISchemeCamperState";
import { SchemeDanger } from "@/mod/scripts/core/schemes/danger/SchemeDanger";
import { StalkerMoveManager } from "@/mod/scripts/core/objects/state/StalkerMoveManager";
import { ITargetStateDescriptor, set_state } from "@/mod/scripts/core/objects/state/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { parsePathWaypoints } from "@/mod/scripts/utils/parse";
import { isStalkerAtWaypoint } from "@/mod/scripts/utils/position";

/**
 * todo;
 */
@LuabindClass()
export class ActionCamperPatrol extends action_base {
  public state: ISchemeCamperState;
  public moveManager: StalkerMoveManager;

  public flag: Optional<number> = null;
  public danger: boolean = false;
  public next_point: Optional<ICampPoint> = null;
  public scantime: Optional<number> = null;
  public direction: Optional<XR_vector> = null;
  public position: Optional<XR_vector> = null;
  public look_position: Optional<XR_vector> = null;
  public dest_position: Optional<XR_vector> = null;
  public look_point: Optional<XR_vector> = null;
  public point_0: Optional<XR_vector> = null;
  public point_2: Optional<XR_vector> = null;
  public enemy: Optional<XR_game_object> = null;
  public enemy_position: Optional<XR_vector> = null;

  /**
   * todo;
   */
  public constructor(state: ISchemeCamperState, object: XR_game_object) {
    super(null, ActionCamperPatrol.__name);

    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;
    this.state.scan_table = new LuaTable();
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.resetScheme();
    this.enemy_position = null;
  }

  /**
   * todo;
   */
  public resetScheme(): void {
    set_state(this.object, "patrol", null, null, null, null);
    this.state.signals = new LuaTable();
    this.state.scan_table = new LuaTable();

    if (this.state.sniper === true) {
      this.moveManager.reset(
        this.state.path_walk,
        parsePathWaypoints(this.state.path_walk)!,
        null,
        null,
        null,
        this.state.suggested_state,
        { obj: this, func: this.process_point },
        null,
        null,
        null
      );

      const path = new patrol(this.state.path_look);

      if (path !== null) {
        for (const k of $range(0, path.count() - 1)) {
          for (const i of $range(0, 31)) {
            if (path.flag(k, i)) {
              if (this.state.scan_table.get(i) === null) {
                this.state.scan_table.set(i, new LuaTable());
              }

              table.insert(this.state.scan_table.get(i), { key: k, pos: path.point(k) });
            }
          }
        }
      }

      if (!this.object.sniper_update_rate()) {
        this.object.sniper_update_rate(true);
      }
    } else {
      this.moveManager.reset(
        this.state.path_walk,
        parsePathWaypoints(this.state.path_walk)!,
        this.state.path_look,
        parsePathWaypoints(this.state.path_look),
        null,
        this.state.suggested_state,
        { obj: this, func: this.process_point },
        null,
        null,
        null
      );

      if (this.object.sniper_update_rate()) {
        this.object.sniper_update_rate(false);
      }
    }

    this.state.last_look_point = null;
    this.state.cur_look_point = null;
    this.state.scan_begin = null;
  }

  /**
   * todo;
   */
  public activateScheme(): void {
    this.resetScheme();
  }

  /**
   * todo;
   */
  public can_shoot(): boolean {
    if (this.state.shoot === "always") {
      return true;
    }

    if (this.state.shoot === "none") {
      return false;
    }

    if (this.state.shoot === "terminal") {
      const [isOnTerminalWaypoint] = this.moveManager.standing_on_terminal_waypoint();

      return isOnTerminalWaypoint;
    }

    abort("Camper: unrecognized shoot type [%s] for [%s]", tostring(this.state.shoot), this.object.name());

    return true;
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
    this.enemy = this.object.best_enemy();

    if (this.enemy !== null) {
      this.state.mem_enemy = this.object.memory_time(this.enemy);

      if (this.state.mem_enemy === null || time_global() - this.state.mem_enemy > this.state.idle) {
        this.enemy = null;
        this.state.mem_enemy = null;
        this.moveManager.continue();
      }
    } else {
      if (this.state.mem_enemy !== null) {
        this.state.mem_enemy = null;
        this.moveManager.continue();
      }
    }

    if (this.enemy !== null) {
      if (this.object.see(this.enemy) === true && this.can_shoot()) {
        if (this.state.sniper === true) {
          if (this.state.suggested_state.campering_fire) {
            set_state(
              this.object,
              this.state.suggested_state.campering_fire,
              null,
              null,
              { look_object: this.enemy, look_position: this.enemy.position() },
              { animation: true }
            );
          } else {
            set_state(
              this.object,
              "hide_sniper_fire",
              null,
              null,
              { look_object: this.enemy, look_position: this.enemy.position() },
              { animation: true }
            );
          }
        } else {
          if (this.state.suggested_state.campering_fire) {
            set_state(
              this.object,
              this.state.suggested_state.campering_fire,
              null,
              null,
              { look_object: this.enemy, look_position: this.enemy.position() },
              { animation: true }
            );
          } else {
            set_state(
              this.object,
              "hide_fire",
              null,
              null,
              { look_object: this.enemy, look_position: this.enemy.position() },
              { animation: true }
            );
          }
        }

        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.attack_sound, null, null);
      } else {
        const memory_position = this.object.memory_position(this.enemy);

        if (
          this.enemy_position === null ||
          this.enemy_position.x !== memory_position.x ||
          this.enemy_position.y !== memory_position.y ||
          this.enemy_position.z !== memory_position.z
        ) {
          this.enemy_position = memory_position;

          if (this.state.sniper === true) {
            this.position = this.object.position();

            this.direction = new vector().set(
              this.enemy_position.x - this.position.x,
              0,
              this.enemy_position.z - this.position.z
            );
            this.direction.normalize();

            const wide_sight = this.position.distance_to(this.enemy_position) * math.tan(this.state.enemy_disp);

            this.point_0 = new vector().set(
              this.enemy_position.x + wide_sight * this.direction.z,
              this.enemy_position.y,
              this.enemy_position.z - wide_sight * this.direction.x
            );

            this.point_2 = new vector().set(
              this.enemy_position.x - wide_sight * this.direction.z,
              this.enemy_position.y,
              this.enemy_position.z + wide_sight * this.direction.x
            );

            // todo: Optimize.
            this.state.scan_table!.set(-1, new LuaTable());
            table.insert(this.state.scan_table!.get(-1), { key: 0, pos: this.point_0 });
            table.insert(this.state.scan_table!.get(-1), { key: 1, pos: this.enemy_position });
            table.insert(this.state.scan_table!.get(-1), { key: 2, pos: this.point_2 });
          }
        }

        if (this.state.sniper === true) {
          if (time_global() - this.state.mem_enemy! < this.state.post_enemy_wait) {
            const position: Optional<ITargetStateDescriptor> =
              this.enemy_position !== null ? { look_position: this.enemy_position, look_object: null } : null;

            if (this.state.suggested_state.campering) {
              set_state(this.object, this.state.suggested_state.campering, null, null, position, null);
            } else {
              set_state(this.object, "hide_na", null, null, position, null);
            }
          } else {
            this.scan(-1);
          }
        } else {
          if (this.on_place()) {
            const position: Optional<ITargetStateDescriptor> =
              this.enemy_position !== null ? { look_position: this.enemy_position, look_object: null } : null;

            if (this.state.suggested_state.campering) {
              set_state(this.object, this.state.suggested_state.campering, null, null, position, null);
            } else {
              set_state(this.object, "hide", null, null, position, null);
            }
          } else {
            this.moveManager.continue();
            this.moveManager.update();
          }
        }
      }

      return;
    }

    const danger = this.process_danger();

    if (danger) {
      this.danger = true;

      return;
    }

    if (this.danger) {
      this.danger = false;
      this.moveManager.continue();
    }

    if (this.state.sniper === true) {
      if (this.on_place()) {
        if (this.scantime === null) {
          this.scantime = time_global();
        }

        this.scan(this.state.wp_flag as number);

        const [isOnWaypoint] = this.moveManager.standing_on_terminal_waypoint();

        if (isOnWaypoint) {
          return;
        }

        if (this.scantime !== null && time_global() - this.scantime >= this.state.scantime_free) {
          this.moveManager.continue();
        }
      } else {
        this.scantime = null;
        this.moveManager.update();
      }
    } else {
      this.moveManager.update();
    }
  }

  /**
   * todo;
   */
  public process_danger(): boolean {
    if (!SchemeDanger.isDangerObject(this.object)) {
      return false;
    }

    const best_danger = this.object.best_danger();

    if (best_danger === null) {
      return false;
    }

    const best_danger_object = best_danger.object();
    const bd_type = best_danger.type();
    const position = { look_position: best_danger.position(), look_object: null };

    if (!this.danger) {
      this.object.play_sound(stalker_ids.sound_alarm, 1, 0, 1, 0);
    }

    const urgent_danger =
      best_danger_object !== null && bd_type === danger_object.attacked && time_global() - best_danger.time() < 5000;

    if (urgent_danger === true) {
      const danger_object_position = { look_position: best_danger_object.position(), look_object: null };

      if (this.state.suggested_state.campering_fire) {
        set_state(this.object, this.state.suggested_state.campering_fire, null, null, danger_object_position, null);
      } else {
        set_state(this.object, "hide_fire", null, null, danger_object_position, null);
      }
    } else {
      if (this.state.suggested_state.campering) {
        set_state(this.object, this.state.suggested_state.campering, null, null, position, null);
      } else {
        if (this.state.sniper === true) {
          set_state(this.object, "hide_na", null, null, position, null);
        } else {
          set_state(this.object, "hide", null, null, position, null);
        }
      }
    }

    return true;
  }

  /**
   * todo;
   */
  public scan(flag: number): void {
    if (this.state.scan_table!.get(flag) === null) {
      return;
    }

    if (this.flag !== flag) {
      this.flag = flag;
      this.state.scan_begin = null;
      this.state.cur_look_point = null;
      this.state.last_look_point = null;
    }

    if (this.state.scan_begin === null || time_global() - this.state.scan_begin > this.state.time_scan_delta) {
      this.next_point = this.get_next_point(flag);
      if (this.state.cur_look_point === null) {
        this.state.cur_look_point = 1;
      }

      if (this.state.last_look_point === null) {
        this.state.last_look_point = this.next_point;
      }

      this.look_position = this.state.last_look_point.pos;
      this.dest_position = this.next_point.pos;
      this.look_point = new vector().set(
        this.look_position!.x +
          (this.state.cur_look_point * (this.dest_position.x - this.look_position!.x)) / this.state.scandelta,
        this.look_position!.y +
          (this.state.cur_look_point * (this.dest_position.y - this.look_position!.y)) / this.state.scandelta,
        this.look_position!.z +
          (this.state.cur_look_point * (this.dest_position.z - this.look_position!.z)) / this.state.scandelta
      );
      if (this.state.suggested_state.campering) {
        set_state(
          this.object,
          this.state.suggested_state.campering,
          null,
          null,
          { look_position: this.look_point, look_object: null },
          null
        );
      } else {
        set_state(this.object, "hide_na", null, null, { look_position: this.look_point, look_object: null }, null);
      }

      if (this.state.cur_look_point >= this.state.scandelta) {
        this.state.cur_look_point = null;
        this.state.last_look_point = this.next_point;
      } else {
        if (this.state.scan_begin !== null) {
          this.state.cur_look_point =
            this.state.cur_look_point + (time_global() - this.state.scan_begin) / this.state.time_scan_delta;
        } else {
          this.state.cur_look_point = this.state.cur_look_point + 1;
        }
      }

      this.state.scan_begin = time_global();
    }
  }

  /**
   * todo;
   */
  public get_next_point(flag: number): ICampPoint {
    let next = false;

    if (this.state.last_look_point === null) {
      table.sort(this.state.scan_table!.get(flag), (a, b) => {
        return a.key < b.key;
      });
    }

    for (const [k, v] of this.state.scan_table!.get(flag)) {
      if (this.state.last_look_point === null) {
        return v;
      }

      if (next === true) {
        return v;
      }

      if (this.state.last_look_point.key === v.key) {
        next = true;
      }
    }

    if (next === true) {
      if (this.state.last_look_point!.key === 0) {
        table.sort(this.state.scan_table!.get(flag), (a, b) => {
          return a.key < b.key;
        });
      } else {
        table.sort(this.state.scan_table!.get(flag), (a, b) => {
          return a.key > b.key;
        });
      }
    }

    return this.state.last_look_point!;
  }

  /**
   * todo;
   */
  public process_point(): boolean {
    return false;
  }

  /**
   * todo;
   */
  public override finalize(): void {
    this.moveManager.finalize();
    super.finalize();
  }

  /**
   * todo;
   */
  public on_place(): boolean {
    if (this.state.no_retreat === true) {
      return false;
    }

    const path = new patrol(this.state.path_walk);

    if (path !== null) {
      for (const k of $range(0, path.count() - 1)) {
        if (isStalkerAtWaypoint(this.object, new patrol(this.state.path_walk), k)) {
          for (const i of $range(0, 31)) {
            if (path.flag(k, i)) {
              this.state.wp_flag = i;

              return true;
            }
          }

          this.state.wp_flag = null;

          return false;
        }
      }

      this.state.wp_flag = null;

      return false;
    }

    return false;
  }
}
