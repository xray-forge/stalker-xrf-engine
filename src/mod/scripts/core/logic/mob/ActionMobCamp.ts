import {
  anim,
  cond,
  look,
  move,
  patrol,
  time_global,
  vector,
  XR_game_object,
  XR_ini_file,
  XR_patrol,
  XR_vector
} from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { campStorage, getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionMobCombat } from "@/mod/scripts/core/logic/mob/ActionMobCombat";
import { get_state, set_state } from "@/mod/scripts/core/logic/mob/MobStateManager";
import { action } from "@/mod/scripts/utils/alife";
import { isMonster, isStalker } from "@/mod/scripts/utils/checkers";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const STATE_CAMP: number = 1;
const STATE_ALIFE: number = 2;
const STATE_MOVE_HOME: number = 3;

const logger: LuaLogger = new LuaLogger("MobCamp");

export class ActionMobCamp extends AbstractSchemeAction {
  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    const new_action = new ActionMobCombat(npc, storage);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, new_action);
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    logger.info("Set scheme:", npc.name(), scheme, section);

    const storage = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    storage.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);

    storage.state = get_state(ini, section, npc);

    storage.look_point = getConfigString(ini, section, "path_look", npc, false, gulag_name);
    storage.home_point = getConfigString(ini, section, "path_home", npc, false, gulag_name);
    storage.time_change_point = getConfigNumber(ini, section, "time_change_point", npc, false, 10000);
    storage.home_min_radius = getConfigNumber(ini, section, "home_min_radius", npc, false, 30);
    storage.home_max_radius = getConfigNumber(ini, section, "home_max_radius", npc, false, 40);

    // -- check min && max radius
    if (storage.home_min_radius > storage.home_max_radius) {
      abort("Mob_Camp : Home Min Radius MUST be < Max Radius");
    }

    // -- check if there is look point (must be!)
    if (!storage.look_point || !(new patrol(storage.look_point) as any)) {
      abort("Mob_Camp : object '%s': unable to find look_point '%s' on the map", npc.name(), storage.look_point);
    }

    // -- load transfer enemy flag ()
    storage.skip_transfer_enemy = ini.line_exist(section, "skip_transfer_enemy");
  }

  public look_path!: XR_patrol;
  public home_path: Optional<XR_patrol> = null;
  public camp_position!: XR_vector;
  public camp_node!: number;
  public state_current!: number;
  public state_prev!: number;
  public cur_point_index!: number;
  public time_point_changed!: number;
  public prev_enemy!: boolean;

  public reset_scheme(): void {
    get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);

    set_state(this.object, getActor()!, this.state.state);

    this.state.signals = {};

    this.look_path = new patrol(this.state.look_point);

    if (!this.look_path) {
      abort("object '%s': unable to find look_point '%s' on the map", this.object.name(), this.state.look_point);
    }

    if (this.state.home_point) {
      this.home_path = new patrol(this.state.home_point);
      if (!this.home_path) {
        abort("object '%s': unable to find home_point '%s' on the map", this.object.name(), this.state.home_point);
      }
    } else {
      this.home_path = null;
    }

    if (this.home_path) {
      if (this.home_path.count() !== this.look_path.count()) {
        abort(
          "object '%s': you must setup home path points count must be equal to look path points count!",
          this.object.name()
        );
      }
    }

    this.camp_position = new vector().set(this.object.position());
    this.camp_node = this.object.level_vertex_id();
    this.state_current = STATE_CAMP;
    this.state_prev = this.state_current;

    this.cur_point_index = 0;

    this.select_current_home_point(true);

    this.time_point_changed = time_global();
    this.prev_enemy = false;

    if (this.state.skip_transfer_enemy) {
      this.object.skip_transfer_enemy(true);
    }
  }

  public update(delta: number): void {
    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, getActor())) {
      return;
    }

    if (!this.object.alive()) {
      get_global<AnyCallablesModule>("xr_logic").mob_release(this.object);

      return;
    }

    if (this.time_point_changed + this.state.time_change_point < time_global()) {
      this.select_current_home_point(false);
      this.time_point_changed = time_global();
    }

    this.select_state();
    this.execute_state();
  }

  public select_current_home_point(first_call: boolean): void {
    const prev_point_index = this.cur_point_index;

    if (this.home_path) {
      // -- fill table of free points
      const free_points: LuaTable<number, number> = new LuaTable();

      if (campStorage.get(this.state.home_point) === null) {
        campStorage.set(this.state.home_point, {});
      }

      for (const i of $range(1, this.home_path.count())) {
        if (campStorage.get(this.state.home_point)[i] === null || campStorage.get(this.state.home_point)[i] === false) {
          table.insert(free_points, i);
        }
      }

      if (free_points.length() < 1) {
        if (first_call === true) {
          abort("Mob_Camp : too many campers for home path");
        }
      } else {
        const free_points_index = math.random(1, free_points.length());

        this.cur_point_index = free_points.get(free_points_index) - 1;
      }

      if (!first_call) {
        if (prev_point_index !== this.cur_point_index) {
          campStorage.get(this.state.home_point)[prev_point_index + 1] = false;
        }
      }

      campStorage.get(this.state.home_point)[this.cur_point_index + 1] = true;
    } else {
      this.cur_point_index = math.random(0, this.look_path.count() - 1);
    }
  }

  public select_state(): void {
    this.state_prev = this.state_current;

    let home_position = this.camp_position;
    let home_node = this.camp_node;

    if (this.home_path) {
      home_position = this.home_path.point(this.cur_point_index);
      home_node = this.home_path.level_vertex_id(this.cur_point_index);
    }

    // -- if enemy
    const enemy = this.object.get_enemy();

    // -- if enemy just appeared - signal
    if (enemy !== null) {
      if (!this.prev_enemy) {
        this.state.signals["enemy"] = true;
      }

      this.prev_enemy = true;
    } else {
      this.prev_enemy = false;
    }

    if (enemy !== null) {
      const enemy_dist = enemy.position().distance_to(home_position);
      // --const my_dist        = this.object.position().distance_to(home_position)

      if (this.state_prev === STATE_MOVE_HOME && enemy_dist > this.state.home_min_radius) {
        // empty
      } else if (this.state_prev === STATE_ALIFE && enemy_dist > this.state.home_max_radius) {
        this.state_current = STATE_MOVE_HOME;
      } else if (this.state_prev === STATE_CAMP && enemy_dist > this.state.home_min_radius) {
        // empty
      } else {
        this.state_current = STATE_ALIFE;
      }
    }

    // -- select MOVE_HOME OR CAMP
    if (enemy === null || (enemy !== null && this.state_current !== STATE_ALIFE)) {
      // -- check if we go home
      if (home_position.distance_to(this.object.position()) > 1 && home_node !== this.object.level_vertex_id()) {
        this.state_current = STATE_MOVE_HOME;
      } else {
        // -- we are on place - camp!
        this.state_current = STATE_CAMP;
      }
    }

    const h = this.object.get_monster_hit_info();

    if (enemy === null && h.who && h.time !== 0 && (isMonster(h.who) || isStalker(h.who))) {
      const dist = this.object.position().distance_to(home_position);

      if (dist < this.state.home_min_radius) {
        this.state_current = STATE_ALIFE;
      }
    }
  }

  public execute_state(): void {
    // -- DBG
    // --    if (this.state_current !== this.state_prev) then
    // --        const str1 = ""
    // --        const str2 = ""
    // --
    // --        if this.state_current === STATE_CAMP then str1 = "STATE_CAMP" end
    // --        if this.state_current === STATE_JUMP then str1 = "STATE_JUMP" end
    // --        if this.state_current === STATE_ALIFE then str1 = "STATE_ALIFE" end
    // --        if this.state_current === STATE_MOVE_HOME then str1 = "STATE_MOVE_HOME" end
    // --
    // --        if this.state_prev === STATE_CAMP then str2 = "STATE_CAMP" end
    // --        if this.state_prev === STATE_JUMP then str2 = "STATE_JUMP" end
    // --        if this.state_prev === STATE_ALIFE then str2 = "STATE_ALIFE" end
    // --        if this.state_prev === STATE_MOVE_HOME then str2 = "STATE_MOVE_HOME" end
    // --
    // --        printf("~MOB_CAMP: From [%s] To [%s]", str2, str1)
    // --    end

    if (this.state_current === STATE_ALIFE && this.state_prev === STATE_ALIFE) {
      return;
    }

    if (this.state_current === STATE_ALIFE && this.state_prev !== STATE_ALIFE) {
      get_global<AnyCallablesModule>("xr_logic").mob_release(this.object);

      return;
    }

    if (this.state_current !== STATE_ALIFE && this.state_prev === STATE_ALIFE) {
      get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);
    }

    if (this.state_current === STATE_CAMP) {
      // -- handle look point
      if (!this.object.action()) {
        action(
          this.object,
          new anim(anim.stand_idle),
          new look(look.point, this.look_path.point(this.cur_point_index)),
          new cond(cond.look_end)
        );
      }

      return;
    }

    if (this.state_current === STATE_MOVE_HOME) {
      if (!this.object.action()) {
        let home_position = this.camp_position;
        let home_node = this.camp_node;

        if (this.home_path) {
          home_position = this.home_path.point(this.cur_point_index);
          home_node = this.home_path.level_vertex_id(this.cur_point_index);
        }

        action(this.object, new move(move.run_fwd, home_node!, home_position), new cond(cond.move_end));
      }

      return;
    }
  }

  public deactivate(): void {
    if (this.home_path) {
      campStorage.get(this.state.home_point)[this.cur_point_index + 1] = false;
    }

    this.object.skip_transfer_enemy(false);
  }

  public net_destroy(): void {
    if (this.home_path) {
      campStorage.get(this.state.home_point)[this.cur_point_index + 1] = false;
    }

    this.object.skip_transfer_enemy(false);
  }
}
