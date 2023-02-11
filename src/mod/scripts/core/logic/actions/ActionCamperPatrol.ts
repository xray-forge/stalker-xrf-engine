import {
  action_base,
  danger_object,
  patrol,
  stalker_ids,
  time_global,
  vector,
  XR_action_base,
  XR_game_object,
  XR_vector,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { ActionDanger } from "@/mod/scripts/core/logic/ActionDanger";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { isStalkerAtWaypoint } from "@/mod/scripts/utils/world";

export interface IActionCamperPatrol extends XR_action_base {
  state: IStoredObject;
  move_mgr: MoveManager;
  flag: number;
  danger: boolean;
  next_point: Optional<ICampPoint>;

  scantime: Optional<number>;
  direction: XR_vector;
  position: XR_vector;
  look_position: XR_vector;
  dest_position: XR_vector;
  look_point: XR_vector;
  point_0: XR_vector;
  point_2: XR_vector;
  enemy: Optional<XR_game_object>;
  enemy_position: Optional<XR_vector>;

  reset_scheme(): void;
  activate_scheme(): void;
  can_shoot(): boolean;
  scan(flag: number): void;
  process_danger(): boolean;
  get_next_point(flag: number): ICampPoint;
  process_point(): boolean;
  on_place(): boolean;
}

interface ICampPoint {
  key: number;
  pos: XR_vector;
}

export const ActionCamperPatrol: IActionCamperPatrol = declare_xr_class("ActionCamperPatrol", action_base, {
  __init(npc: XR_game_object, action_name: string, storage: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = storage;
    this.move_mgr = storage[npc.id()].move_mgr;
    this.state.scan_table = new LuaTable();
  },
  initialize(): void {
    action_base.initialize(this);

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.reset_scheme();
    this.enemy_position = null;
  },
  reset_scheme(): void {
    set_state(this.object, "patrol", null, null, null, null);
    this.state.signals = {};
    this.state.scan_table = new LuaTable();

    if (this.state.sniper === true) {
      this.move_mgr.reset(
        this.state.path_walk,
        path_parse_waypoints(this.state.path_walk)!,
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

      if (this.object.sniper_update_rate() === false) {
        this.object.sniper_update_rate(true);
      }
    } else {
      this.move_mgr.reset(
        this.state.path_walk,
        path_parse_waypoints(this.state.path_walk)!,
        this.state.path_look,
        path_parse_waypoints(this.state.path_look),
        null,
        this.state.suggested_state,
        { obj: this, func: this.process_point },
        null,
        null,
        null
      );

      if (this.object.sniper_update_rate() === true) {
        this.object.sniper_update_rate(false);
      }
    }

    this.state.last_look_point = null;
    this.state.cur_look_point = null;
    this.state.scan_begin = null;
  },
  activate_scheme(): void {
    this.reset_scheme();
  },
  can_shoot(): boolean {
    if (this.state.shoot === "always") {
      return true;
    }

    if (this.state.shoot === "none") {
      return false;
    }

    if (this.state.shoot === "terminal") {
      const [isOnTerminalWaypoint] = this.move_mgr.standing_on_terminal_waypoint();

      return isOnTerminalWaypoint;
    }

    abort("Camper: unrecognized shoot type [%s] for [%s]", tostring(this.state.shoot), this.object.name());

    return true;
  },
  execute(): void {
    action_base.execute(this);
    this.enemy = this.object.best_enemy();

    if (this.enemy !== null) {
      this.state.mem_enemy = this.object.memory_time(this.enemy);

      if (this.state.mem_enemy === null || time_global() - this.state.mem_enemy > this.state.idle) {
        this.enemy = null;
        this.state.mem_enemy = null;
        this.move_mgr.continue();
      }
    } else {
      if (this.state.mem_enemy !== null) {
        this.state.mem_enemy = null;
        this.move_mgr.continue();
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

        GlobalSound.set_sound_play(this.object.id(), this.state.attack_sound, null, null);
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
          if (time_global() - this.state.mem_enemy < this.state.post_enemy_wait) {
            const position = this.enemy_position !== null ? { look_position: this.enemy_position } : null;

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
            const position = this.enemy_position !== null ? { look_position: this.enemy_position } : null;

            if (this.state.suggested_state.campering) {
              set_state(this.object, this.state.suggested_state.campering, null, null, position, null);
            } else {
              set_state(this.object, "hide", null, null, position, null);
            }
          } else {
            this.move_mgr.continue();
            this.move_mgr.update();
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

    if (this.danger === true) {
      this.danger = false;
      this.move_mgr.continue();
    }

    if (this.state.sniper === true) {
      if (this.on_place()) {
        if (this.scantime === null) {
          this.scantime = time_global();
        }

        this.scan(this.state.wp_flag);

        const [isOnWaypoint] = this.move_mgr.standing_on_terminal_waypoint();

        if (isOnWaypoint) {
          return;
        }

        if (this.scantime !== null && time_global() - this.scantime >= this.state.scantime_free) {
          this.move_mgr.continue();
        }
      } else {
        this.scantime = null;
        this.move_mgr.update();
      }
    } else {
      this.move_mgr.update();
    }
  },
  process_danger(): boolean {
    if (!ActionDanger.is_danger(this.object)) {
      return false;
    }

    const best_danger = this.object.best_danger();

    if (best_danger === null) {
      return false;
    }

    const best_danger_object = best_danger.object();
    const bd_type = best_danger.type();
    const passed_time = time_global() - best_danger.time();
    const position = { look_position: best_danger.position() };

    if (this.danger !== true) {
      this.object.play_sound(stalker_ids.sound_alarm, 1, 0, 1, 0);
    }

    const urgent_danger =
      best_danger_object !== null && bd_type === danger_object.attacked && time_global() - best_danger.time() < 5000;

    if (urgent_danger === true) {
      const danger_object_position = { look_position: best_danger_object.position() };

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
  },
  scan(flag: number): void {
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
        this.look_position.x +
          (this.state.cur_look_point * (this.dest_position.x - this.look_position.x)) / this.state.scandelta,
        this.look_position.y +
          (this.state.cur_look_point * (this.dest_position.y - this.look_position.y)) / this.state.scandelta,
        this.look_position.z +
          (this.state.cur_look_point * (this.dest_position.z - this.look_position.z)) / this.state.scandelta
      );
      if (this.state.suggested_state.campering) {
        set_state(
          this.object,
          this.state.suggested_state.campering,
          null,
          null,
          { look_position: this.look_point },
          null
        );
      } else {
        set_state(this.object, "hide_na", null, null, { look_position: this.look_point }, null);
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
  },
  get_next_point(flag: number): ICampPoint {
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
      if (this.state.last_look_point.key === 0) {
        table.sort(this.state.scan_table!.get(flag), (a, b) => {
          return a.key < b.key;
        });
      } else {
        table.sort(this.state.scan_table!.get(flag), (a, b) => {
          return a.key > b.key;
        });
      }
    }

    return this.state.last_look_point;
  },
  process_point(): boolean {
    return false;
  },
  finalize(): void {
    this.move_mgr.finalize();
    action_base.finalize(this);
  },
  on_place(): boolean {
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
  },
} as IActionCamperPatrol);
