import { level, patrol, XR_CHelicopter, XR_game_object, XR_ini_file, XR_patrol, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { get_heli_firer, HeliFire } from "@/mod/scripts/core/logic/heli/HeliFire";
import { get_heli_flyer, HeliFly } from "@/mod/scripts/core/logic/heli/HeliFly";
import { get_heli_looker, HeliLook } from "@/mod/scripts/core/logic/heli/HeliLook";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";

const state_move: number = 0;

export class ActionHeliMove extends AbstractSchemeAction {
  public static SCHEME_SECTION: string = "heli_move";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    const new_action = new ActionHeliMove(npc, storage);

    get_global<AnyCallablesModule>("xr_logic.").subscribe_action_for_events(npc, storage, new_action);
  }

  public static set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const a = get_global<AnyCallablesModule>("xr_logic.").assign_storage_and_bind(npc, ini, scheme, section);

    a.logic = get_global<AnyCallablesModule>("xr_logic.").cfg_get_switch_conditions(ini, section, npc);

    a.path_move = getConfigString(ini, section, "path_move", npc, true, "");
    a.path_look = getConfigString(ini, section, "path_look", npc, false, "");
    a.enemy_ = getConfigString(ini, section, "enemy", npc, false, "");
    a.fire_point = getConfigString(ini, section, "fire_point", npc, false, "");
    a.max_velocity = getConfigNumber(ini, section, "max_velocity", npc, true, null);
    a.max_mgun_dist = getConfigNumber(ini, section, "max_mgun_attack_dist", npc, false);
    a.max_rocket_dist = getConfigNumber(ini, section, "max_rocket_attack_dist", npc, false);
    a.min_mgun_dist = getConfigNumber(ini, section, "min_mgun_attack_dist", npc, false);
    a.min_rocket_dist = getConfigNumber(ini, section, "min_rocket_attack_dist", npc, false);
    a.upd_vis = getConfigNumber(ini, section, "upd_vis", npc, false, 10);
    a.use_rocket = getConfigBoolean(ini, section, "use_rocket", npc, false, true);
    a.use_mgun = getConfigBoolean(ini, section, "use_mgun", npc, false, true);
    a.engine_sound = getConfigBoolean(ini, section, "engine_sound", npc, false, true);
    a.stop_fire = getConfigBoolean(ini, section, "stop_fire", npc, false, false);
    a.show_health = getConfigBoolean(ini, section, "show_health", npc, false, false);
    a.fire_trail = getConfigBoolean(ini, section, "fire_trail", npc, false, false);

    const st = storage.get(npc.id());

    st.invulnerable = getConfigBoolean(ini, section, "invulnerable", npc, false, false);
    st.immortal = getConfigBoolean(ini, section, "immortal", npc, false, false);
    st.mute = getConfigBoolean(ini, section, "mute", npc, false, false);
  }

  public readonly heliObject: XR_CHelicopter;

  public heli_look: HeliLook;
  public heli_fire: HeliFire;
  public heli_fly: HeliFly;

  public patrol_move: Optional<XR_patrol> = null;
  public patrol_move_info!: LuaTable<number>;
  public patrol_look: Optional<XR_patrol> = null;

  public max_velocity!: number;
  public heliState: Optional<number> = null;
  public last_index: Optional<number> = null;
  public next_index: Optional<number> = null;
  public _flag_to_wp_callback: Optional<boolean> = null;
  public was_callback: Optional<boolean> = null;
  public by_stop_fire_fly: Optional<boolean> = null;
  public stop_point: Optional<XR_vector> = null;

  public constructor(object: XR_game_object, state: IStoredObject) {
    super(object, state);

    this.heliObject = object.get_helicopter();

    this.heli_fly = get_heli_flyer(object);
    this.heli_fire = get_heli_firer(object);
    this.heli_look = get_heli_looker(object);
  }

  public reset_scheme(loading?: boolean): void {
    this.state.signals = {};
    this.heliObject.TurnEngineSound(this.state.engine_sound);

    if (!level.patrol_path_exists(this.state.path_move)) {
      abort("Patrol path %s doesnt exist", this.state.path_move);
    }

    this.patrol_move = new patrol(this.state.path_move);
    this.patrol_move_info = get_global<AnyCallablesModule>("utils").path_parse_waypoints(this.state.path_move);

    if (this.state.path_look) {
      if (this.state.path_look === "actor") {
        this.heli_fly.set_look_point(getActor()!.position());
        this.update_look_state();
      } else {
        this.patrol_look = new patrol(this.state.path_look);
        this.heli_fly.set_look_point(this.patrol_look.point(0));
        this.update_look_state();
        if (!this.patrol_look) {
          abort("object '%s': unable to find path_look '%s' on the map", this.object.name(), this.state.path_look);
        }
      }
    } else {
      this.patrol_look = null;
    }

    this.max_velocity = this.state.max_velocity;

    if (loading) {
      this.heliState = get_global<AnyCallablesModule>("xr_logic.").pstor_retrieve(this.object, "st");

      this.last_index = get_global<AnyCallablesModule>("xr_logic.").pstor_retrieve(this.object, "li") || null;
      this.next_index = get_global<AnyCallablesModule>("xr_logic.").pstor_retrieve(this.object, "ni") || null;

      this.was_callback = get_global<AnyCallablesModule>("xr_logic.").pstor_retrieve(this.object, "wc");
    } else {
      this.last_index = null;
      this.next_index = null;

      this.heli_fly.max_velocity = this.max_velocity;
      this.heli_fly.heliLAccFW = this.max_velocity / 15;
      this.heli_fly.heliLAccBW = (2 * this.heli_fly.heliLAccFW) / 3;
      this.heliObject.SetLinearAcc(this.heli_fly.heliLAccFW, this.heli_fly.heliLAccBW);

      this.heliObject.SetMaxVelocity(this.max_velocity);

      this.heliState = null;
      this.stop_point = null;
      this.by_stop_fire_fly = false;

      this.was_callback = false;
      this._flag_to_wp_callback = false;
      this.heli_fire.enemy_ = this.state.enemy_;
      this.heli_fire.enemy = null;
      this.heli_fire.flag_by_enemy = true;
      if (this.state.fire_point) {
        this.heli_fire.fire_point = new patrol(this.state.fire_point).point(0);
      }

      if (this.state.max_mgun_dist) {
        this.heliObject.m_max_mgun_dist = this.state.max_mgun_dist;
      }

      if (this.state.max_rocket_dist) {
        this.heliObject.m_max_rocket_dist = this.state.max_rocket_dist;
      }

      if (this.state.min_mgun_dist) {
        this.heliObject.m_min_mgun_dist = this.state.min_mgun_dist;
      }

      if (this.state.min_rocket_dist) {
        this.heliObject.m_min_rocket_dist = this.state.min_rocket_dist;
      }

      if (this.state.use_mgun) {
        this.heliObject.m_use_mgun_on_attack = true;
      } else {
        this.heliObject.m_use_mgun_on_attack = false;
      }

      if (this.state.use_rocket) {
        this.heliObject.m_use_rocket_on_attack = true;
      } else {
        this.heliObject.m_use_rocket_on_attack = false;
      }

      this.heli_fire.upd_vis = this.state.upd_vis;
      this.heli_fire.update_enemy_state();
      this.update_movement_state();

      if (this.state.show_health) {
        this.heli_fire.cs_remove();
        this.heli_fire.show_health = true;
        this.heli_fire.cs_heli();
      } else {
        this.heli_fire.show_health = false;
        this.heli_fire.cs_remove();
      }

      this.heliObject.UseFireTrail(this.state.fire_trail);
    }
  }

  public save(): void {
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "st", this.heliState);
    // ---
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "li", this.last_index || false);
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "ni", this.next_index || false);
    // ---
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "wc", this.was_callback);
  }

  public update(delta: number): void {
    const actor: XR_game_object = getActor()!;

    if (get_global<AnyCallablesModule>("xr_logic.").try_switch_to_another_section(this.object, this.state, actor)) {
      return;
    }

    // --this.heli_fire:update_enemy_state()
    if (this.was_callback) {
      this.update_movement_state();
      this.was_callback = false;
    }

    if (this.state.path_look) {
      if (this.state.path_look === "actor") {
        this.heli_fly.set_look_point(actor.position());
        if (this.state.stop_fire) {
          if (this.heliObject.isVisible(actor)) {
            if (!this.by_stop_fire_fly) {
              this.stop_point = this.object.position();
              this.by_stop_fire_fly = true;
              this.was_callback = true;
              // --'printf("Stop Fire!")
            }
          } else {
            // --'printf("Fly to next point!")
            this.by_stop_fire_fly = false;
            this.was_callback = true;
          }
        }
      }

      this.update_look_state();
    }

    if (!this.state.path_look && this.heli_look.look_state) {
      this.heli_look.calc_look_point(this.heli_fly.dest_point, true);
    }
  }

  public update_movement_state(): void {
    // --'printf("update_movement_state()")
    this.heliState = state_move;

    if (this.patrol_move !== null) {
      if (!this.last_index) {
        this.last_index = 0;
        this.next_index = 1;
      } else {
        this.next_index = this.last_index + 1;

        if (this.next_index >= this.patrol_move.count()) {
          this.next_index = 0;
        }
      }
    }

    if (!this.by_stop_fire_fly) {
      if (this.patrol_move!.count() > 2) {
        this._flag_to_wp_callback = this.heli_fly.fly_on_point_with_vector(
          this.patrol_move!.point(this.last_index!),
          this.patrol_move!.point(this.next_index!),
          this.max_velocity,
          this._flag_to_wp_callback!,
          false
        );
      } else {
        if (this.patrol_move!.count() > 1) {
          this._flag_to_wp_callback = this.heli_fly.fly_on_point_with_vector(
            this.patrol_move!.point(this.last_index!),
            this.patrol_move!.point(this.next_index!),
            this.max_velocity,
            true,
            true
          );
        } else {
          this._flag_to_wp_callback = this.heli_fly.fly_on_point_with_vector(
            this.patrol_move!.point(this.last_index!),
            this.patrol_move!.point(this.last_index!),
            this.max_velocity,
            true,
            true
          );
        }
      }
    } else {
      this._flag_to_wp_callback = this.heli_fly.fly_on_point_with_vector(
        this.stop_point!,
        this.stop_point!,
        this.max_velocity,
        true,
        false
      );
      this._flag_to_wp_callback = true;
    }
  }

  public update_look_state(): void {
    // --'    printf("update_look_state()")
    this.heli_fly.set_block_flook(true);
    this.heli_fly.look_at_position();
  }

  public waypoint_callback(object: XR_game_object, action_type: string, index: number): void {
    if (!this._flag_to_wp_callback) {
      if (this.patrol_move !== null) {
        if (index === this.last_index) {
          return;
        }

        if (index !== -1) {
          this.last_index = index;
        } else {
          if (this.patrol_move_info.get(this.last_index!) !== null) {
            const signal = this.patrol_move_info.get(this.last_index!)["sig"];

            if (signal !== null) {
              this.state.signals[signal] = true;
            }
          }

          if (this.patrol_move.count() > 1) {
            this.last_index = this.next_index;
          }
        }
      }
    }

    this.was_callback = true;
  }
}
