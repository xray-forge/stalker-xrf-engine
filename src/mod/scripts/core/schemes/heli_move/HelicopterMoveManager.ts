import { level, patrol, XR_CHelicopter, XR_game_object, XR_patrol, XR_vector } from "xray16";

import { Optional, TRate } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/database/pstor";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { get_heli_firer, HeliFire } from "@/mod/scripts/core/schemes/heli_move/HeliFire";
import { get_heli_flyer, HeliFly } from "@/mod/scripts/core/schemes/heli_move/HeliFly";
import { get_heli_looker, HeliLook } from "@/mod/scripts/core/schemes/heli_move/HeliLook";
import { ISchemeHelicopterMoveState } from "@/mod/scripts/core/schemes/heli_move/ISchemeHelicopterMoveState";
import { abort } from "@/mod/scripts/utils/debug";
import { parsePathWaypoints } from "@/mod/scripts/utils/parse";

const state_move: number = 0;

/**
 * todo;
 */
export class HelicopterMoveManager extends AbstractSchemeManager<ISchemeHelicopterMoveState> {
  public readonly heliObject: XR_CHelicopter;

  public heli_look: HeliLook;
  public heli_fire: HeliFire;
  public heli_fly: HeliFly;

  public patrol_move: Optional<XR_patrol> = null;
  public patrol_move_info!: LuaTable<number>;
  public patrol_look: Optional<XR_patrol> = null;

  public max_velocity!: TRate;
  public heliState: Optional<number> = null;
  public last_index: Optional<number> = null;
  public next_index: Optional<number> = null;
  public _flag_to_wp_callback: Optional<boolean> = null;
  public was_callback: Optional<boolean> = null;
  public by_stop_fire_fly: Optional<boolean> = null;
  public stop_point: Optional<XR_vector> = null;

  /**
   * todo;
   */
  public constructor(object: XR_game_object, state: ISchemeHelicopterMoveState) {
    super(object, state);

    this.heliObject = object.get_helicopter();

    this.heli_fly = get_heli_flyer(object);
    this.heli_fire = get_heli_firer(object);
    this.heli_look = get_heli_looker(object);
  }

  /**
   * todo;
   */
  public override resetScheme(loading?: boolean): void {
    this.state.signals = new LuaTable();
    this.heliObject.TurnEngineSound(this.state.engine_sound);

    if (!level.patrol_path_exists(this.state.path_move)) {
      abort("Patrol path %s doesnt exist", this.state.path_move);
    }

    this.patrol_move = new patrol(this.state.path_move);
    this.patrol_move_info = parsePathWaypoints(this.state.path_move)!;

    if (this.state.path_look) {
      if (this.state.path_look === "actor") {
        this.heli_fly.set_look_point(registry.actor.position());
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
      this.heliState = pstor_retrieve(this.object, "st");

      this.last_index = pstor_retrieve(this.object, "li") || null;
      this.next_index = pstor_retrieve(this.object, "ni") || null;

      this.was_callback = pstor_retrieve(this.object, "wc");
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

  /**
   * todo;
   */
  public save(): void {
    pstor_store(this.object, "st", this.heliState);
    // ---
    pstor_store(this.object, "li", this.last_index || false);
    pstor_store(this.object, "ni", this.next_index || false);
    // ---
    pstor_store(this.object, "wc", this.was_callback);
  }

  /**
   * todo;
   */
  public override update(delta: number): void {
    const actor: XR_game_object = registry.actor;

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
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

  /**
   * todo;
   */
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

  /**
   * todo;
   */
  public update_look_state(): void {
    // --'    printf("update_look_state()")
    this.heli_fly.set_block_flook(true);
    this.heli_fly.look_at_position();
  }

  /**
   * todo;
   */
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
              this.state.signals!.set(signal, true);
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
