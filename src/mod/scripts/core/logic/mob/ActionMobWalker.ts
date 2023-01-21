import {
  anim,
  cond,
  look,
  move,
  patrol,
  sound,
  TXR_animation,
  TXR_animation_key,
  TXR_sound_key,
  vector,
  XR_flags32,
  XR_game_object,
  XR_ini_file,
  XR_patrol
} from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { TScheme } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { get_state, set_state } from "@/mod/scripts/core/logic/mob/MobStateManager";
import { action } from "@/mod/scripts/utils/alife";
import { getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isStalkerAtWaypoint } from "@/mod/scripts/utils/world";

const default_wait_time: number = 5000;
const default_anim_standing: TXR_animation = anim.stand_idle;

const state_moving: number = 0;
const state_standing: number = 1;
const log: LuaLogger = new LuaLogger("MobWalker");

export class ActionMobWalker extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "mob_walker";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    const new_action = new ActionMobWalker(npc, storage);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, new_action);
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    log.info("Set scheme:", npc.name(), scheme, section);

    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);
    st.state = get_state(ini, section, npc);
    st.no_reset = getConfigBoolean(ini, section, "no_reset", npc, false);
    st.path_walk = getConfigString(ini, section, "path_walk", npc, true, gulag_name);
    st.path_look = getConfigString(ini, section, "path_look", npc, false, gulag_name);

    if (st.path_walk === st.path_look) {
      abort("You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]", section, npc.name());
    }

    st.path_walk_info = null; // -- ����� ���������������� � reset(), ������ ���� ����� ���� ���
    st.path_look_info = null; // -- �� ���������.
  }

  public last_index: Optional<number> = null;
  public patrol_look: Optional<XR_patrol> = null;
  public patrol_walk: Optional<XR_patrol> = null;
  public last_look_index: Optional<number> = null;
  public cur_anim_set: Optional<TXR_animation> = null;
  public scheduled_snd: Optional<TXR_sound_key> = null;
  public pt_wait_time: Optional<number> = null;

  public path_walk_info!: LuaTable<number, LuaTable<string>>;

  public crouch: Optional<boolean> = null;
  public running: Optional<boolean> = null;
  public mob_state: Optional<number> = null;

  public path_look_info: Optional<any> = null;

  public reset_scheme(): void {
    set_state(this.object, getActor()!, this.state.state);

    this.state.signals = {};
    get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);

    this.patrol_walk = new patrol(this.state.path_walk);

    if (!this.patrol_walk) {
      abort("object '%s': unable to find path_walk '%s' on the map", this.object.name(), this.state.path_walk);
    }

    if (this.state.path_look) {
      this.patrol_look = new patrol(this.state.path_look);
      if (!this.patrol_look) {
        abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), this.state.path_look);
      }
    } else {
      this.patrol_look = null;
    }

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = get_global<AnyCallablesModule>("utils").path_parse_waypoints(this.state.path_walk);
      this.path_walk_info = this.state.path_walk_info;
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = get_global<AnyCallablesModule>("utils").path_parse_waypoints(this.state.path_look);
      this.path_look_info = this.state.path_look_info;
    }

    this.mob_state = state_moving;
    this.crouch = false;
    this.running = false;
    this.cur_anim_set = default_anim_standing;
    this.pt_wait_time = default_wait_time;
    this.scheduled_snd = null;
    this.last_index = null;
    this.last_look_index = null;

    action(
      this.object,
      new move(move.walk_fwd, new patrol(this.state.path_walk, patrol.next, patrol.continue)),
      new cond(cond.move_end)
    );
  }

  public update(): void {
    // --    printf("__bp: mob_walker update: %d", time_global())
    // --if !xr_logic.is_active(this.object, this.state) then
    // --    return
    // --end
    const actor = getActor()!;

    if (!get_global<AnyCallablesModule>("xr_logic").mob_captured(this.object)) {
      this.reset_scheme();

      return;
    }

    /*
      --[[
          if this:arrived_to_first_waypoint() then
            if xr_logic.try_switch_to_another_section(this.object, this.state, actor) then
              return
            end
          end
        ]]
     */
    if (this.mob_state === state_standing) {
      if (!this.object.action()) {
        const patrol_walk_count = this.patrol_walk!.count();

        if (patrol_walk_count === 1 && isStalkerAtWaypoint(this.object, this.patrol_walk!, 0)) {
          this.mob_state = state_moving;
          this.waypoint_callback(this.object, null, this.last_index);
        } else {
          this.last_look_index = null;
          this.mob_state = state_moving;
          this.update_movement_state();
        }
      }
    }
  }

  public arrived_to_first_waypoint(): boolean {
    return this.last_index !== null;
  }

  public waypoint_callback(obj: XR_game_object, action_type: Optional<string>, index: Optional<number>): void {
    if (index === -1 || index === null) {
      return;
    }

    this.last_index = index;

    const suggested_snd = this.path_walk_info.get(index).get("s");

    if (suggested_snd) {
      this.scheduled_snd = suggested_snd;
    }

    const suggested_crouch = this.path_walk_info.get(index).get("c");

    if (suggested_crouch === "true") {
      this.crouch = true;
    } else {
      this.crouch = false;
    }

    const suggested_running = this.path_walk_info.get(index).get("r");

    if (suggested_running === "true") {
      this.running = true;
    } else {
      this.running = false;
    }

    const sig = this.path_walk_info.get(index).get("sig");

    if (sig !== null) {
      // -- HACK, fixme:
      const npc_id = this.object.id();
      const scheme: TScheme = storage.get(npc_id)["active_scheme"]!;
      const signals: LuaTable = storage.get(npc_id)[scheme!].signals;

      signals.set(sig, true);
    }

    const beh = this.path_walk_info.get(index).get("b");

    if (beh) {
      set_state(this.object, getActor()!, beh);
    } else {
      set_state(this.object, getActor()!, this.state.state);
    }

    const search_for = this.path_walk_info.get(index).get("flags") as XR_flags32;

    if (search_for.get() === 0) {
      this.update_movement_state();

      return;
    }

    const pt_chosen_idx = get_global<AnyCallablesModule>("move_mgr").choose_look_point(
      this.patrol_look,
      this.path_look_info,
      search_for
    );

    if (pt_chosen_idx) {
      const suggested_wait_time = this.path_look_info[pt_chosen_idx]["t"];

      if (suggested_wait_time) {
        this.pt_wait_time = tonumber(suggested_wait_time)!;
      } else {
        const patrol_walk_count = this.patrol_walk!.count();

        if (patrol_walk_count === 1 && isStalkerAtWaypoint(this.object, this.patrol_walk!, 0)) {
          this.pt_wait_time = get_global("time_infinite");
        } else {
          this.pt_wait_time = default_wait_time;
        }
      }

      let suggested_anim_set = this.path_look_info[pt_chosen_idx]["a"];

      if (suggested_anim_set) {
        if (suggested_anim_set === "nil") {
          suggested_anim_set = null;
        }

        this.cur_anim_set =
          anim[
            get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
              getActor()!,
              this.object,
              suggested_anim_set
            ) as TXR_animation_key
          ];
      } else {
        this.cur_anim_set = default_anim_standing;
      }

      const beh = this.path_walk_info.get(index).get("b");

      if (beh) {
        set_state(this.object, getActor()!, beh);
      } else {
        set_state(this.object, getActor()!, this.state.state);
      }

      if (pt_chosen_idx !== this.last_look_index) {
        this.look_at_waypoint(pt_chosen_idx);
      }

      this.mob_state = state_standing;
      this.update_standing_state();

      this.update();
    } else {
      abort("object '%s': cannot find corresponding point(s) on path_look '%s'", this.object.name(), index);
    }
  }

  public update_movement_state(): void {
    get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);

    let m;

    if (this.running) {
      m = move.run_fwd;
    } else if (this.crouch) {
      m = move.steal;
    } else {
      m = move.walk_fwd;
    }

    if (this.scheduled_snd) {
      action(
        this.object,
        new move(m, new patrol(this.state.path_walk, patrol.next, patrol.continue)),
        new sound(sound[this.scheduled_snd]),
        new cond(cond.move_end)
      );
      this.scheduled_snd = null;
    } else {
      action(
        this.object,
        new move(m, new patrol(this.state.path_walk, patrol.next, patrol.continue)),
        new cond(cond.move_end)
      );
    }
  }

  public update_standing_state(): void {
    get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);
    if (this.scheduled_snd) {
      action(
        this.object,
        new anim(this.cur_anim_set!, 0),
        new sound(sound[this.scheduled_snd]),
        new cond(cond.time_end, this.pt_wait_time!)
      );
      this.scheduled_snd = null;
    } else {
      action(this.object, new anim(this.cur_anim_set!, 0), new cond(cond.time_end, this.pt_wait_time!));
    }
  }

  public deactivate(): void {
    get_global("xr_logic").mob_capture(this.object, true);
    action(this.object, new move(move.steal, this.patrol_walk!.point(0)), new cond(cond.move_end));
  }

  public look_at_waypoint(pt: number): void {
    if (!this.patrol_look) {
      return;
    }

    const look_pt = new vector().set(this.patrol_look.point(pt)).sub(this.object.position());

    look_pt.normalize();
    // --this.object:set_sight(look.direction, look_pt, 0)

    get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);
    action(this.object, new look(look.direction, look_pt), new cond(cond.look_end));

    this.last_look_index = pt;
  }
}
