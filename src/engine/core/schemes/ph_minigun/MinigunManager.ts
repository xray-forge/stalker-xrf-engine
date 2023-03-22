import { CCar, level, move, patrol, time_global, vector, XR_CCar, XR_game_object, XR_vector } from "xray16";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeMinigunState } from "@/engine/core/schemes/ph_minigun/ISchemeMinigunState";
import { isHeavilyWounded } from "@/engine/core/utils/check/check";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { isObjectScriptCaptured, scriptReleaseObject } from "@/engine/core/utils/object";
import { TConditionList } from "@/engine/core/utils/parse";
import { yaw } from "@/engine/core/utils/physics";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import { Optional, TName, TStringId } from "@/engine/lib/types";

const state_cannon_rotate: number = 1;
const state_cannon_follow: number = 2;
const state_cannon_delay: number = 3;
const state_cannon_stop: number = 4;
const state_shooting_on: number = 1;
const state_none: number = 0;
const state_firetarget_points: number = 1;
const state_firetarget_enemy: number = 2;
const def_max_fc_upd_num: number = 1;

/**
 * todo;
 */
export class MinigunManager extends AbstractSchemeManager<ISchemeMinigunState> {
  public mgun: XR_CCar;
  public start_direction: XR_vector;
  public start_look_pos: XR_vector;

  public destroyed: boolean = false;
  public state_cannon: number = -1;
  public state_firetarget: number = -1;
  public state_shooting: number = -1;

  public start_delaying_time: number = 0;
  public start_shooting_time: number = 0;
  public fc_upd_num: number = 0;
  public fc_upd_avg: number = 0;
  public fc_last_upd_tm: number = 0;

  public last_pos: Optional<XR_vector> = null;
  public last_pos_time: number = 0;
  public state_delaying: boolean = false;
  public hasWeapon: boolean = false;

  public target_obj: Optional<XR_game_object> = null;
  public target_fire_pt: Optional<XR_vector> = null;
  public target_fire_pt_idx: number = 0;
  public fire_range_sqr: number = 0;
  public def_fire_time: number = 0;
  public def_fire_rep: number = 0;
  public fire_rep: number = 0;

  public fire_track_target: Optional<boolean> = null;
  public path_fire: Optional<string> = null;
  public path_fire_point: Optional<XR_vector> = null;
  public on_target_vis: Optional<{ v1: XR_game_object; condlist: TConditionList; name: TName }> = null;
  public on_target_nvis: Optional<{ v1: XR_game_object; condlist: TConditionList; name: TName }> = null;

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object, state: ISchemeMinigunState) {
    super(object, state);

    this.mgun = this.object.get_car();
    this.start_direction = this.object.direction();
    this.start_look_pos = new vector().set(0, 0, 0);
    this.start_look_pos.x = this.object.position().x + 5 * math.sin(this.start_direction.x);
    this.start_look_pos.z = this.object.position().z + 5 * math.cos(this.start_direction.x);
    this.start_look_pos.y = this.object.position().y;
  }

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.start_delaying_time = time_global();
    this.start_shooting_time = time_global();

    this.fc_upd_num = 0; // -- fastcall updates num
    this.fc_upd_avg = 10; // -- average time of the fastcall updates (in millisecond)
    this.fc_last_upd_tm = -1; // -- fastcall last update time

    this.state.signals = new LuaTable();
    this.last_pos = null;
    this.last_pos_time = 0;

    this.state_delaying = false;
    this.destroyed = false;

    this.object.set_nonscript_usable(false);
    this.object.set_tip_text("");

    if (this.mgun.HasWeapon()) {
      this.mgun.Action(CCar.eWpnActivate, 1);
      this.hasWeapon = true;
    } else {
      this.hasWeapon = false;
    }

    this.state_firetarget = state_none;
    this.state_cannon = state_none;
    this.state_shooting = state_none;

    this.target_fire_pt = null;
    this.target_fire_pt_idx = 0;
    this.target_obj = null;

    this.on_target_vis = null;
    this.on_target_nvis = null;

    const actor: XR_game_object = registry.actor;

    if (this.hasWeapon) {
      if (this.state.fire_target === "points") {
        this.state_firetarget = state_firetarget_points;
      } else {
        if (this.state.fire_target === ACTOR && actor.alive()) {
          this.target_obj = actor;
          this.state_firetarget = state_firetarget_enemy;
        } else {
          const n = this.state.fire_target;

          if (n !== null) {
            const obj = getObjectByStoryId(n);

            if (obj && obj.alive()) {
              this.target_obj = obj;
              this.state_firetarget = state_firetarget_enemy;
            }
          }
        }
      }

      this.fire_track_target = this.state.fire_track_target;

      if (this.state.on_target_vis) {
        const vis = this.state.on_target_vis;

        if (vis.v1 !== null) {
          const storyObject = getObjectByStoryId(vis.v1 as TStringId);

          if (storyObject && storyObject.alive()) {
            vis.v1 = storyObject as any;
            this.on_target_vis = vis as any;
          }
        }
      }

      if (this.state.on_target_nvis) {
        const nvis = this.state.on_target_nvis;

        if (nvis.v1 !== null) {
          const storyObject = getObjectByStoryId(nvis.v1 as TStringId);

          if (storyObject && storyObject.alive()) {
            nvis.v1 = storyObject as any;
            this.on_target_nvis = nvis as any;
          }
        }
      }

      this.path_fire = this.state.path_fire;
      this.path_fire_point = null;

      if (this.path_fire !== null) {
        if (level.patrol_path_exists(this.path_fire)) {
          this.path_fire_point = new patrol(this.path_fire).point(0);
        } else {
          abort("[ph_minigun] patrol path %s doesnt exist.", tostring(this.path_fire));
        }
      }

      this.def_fire_time = this.state.fire_time;
      this.def_fire_rep = this.state.fire_rep;
      this.fire_rep = this.def_fire_rep;

      this.fire_range_sqr = this.state.fire_range * this.state.fire_range;

      if (this.state_firetarget === state_firetarget_points && this.path_fire) {
        this.state_cannon = state_cannon_follow;
        this.state_shooting = state_none;
      } else if (this.state_firetarget === state_firetarget_enemy) {
        this.state_shooting = state_none;
        this.state_cannon = state_cannon_follow;
      } else {
        this.state_firetarget = state_none;
        this.state_cannon = state_none;
        this.state_shooting = state_none;
      }
    }

    this.object.set_fastcall(this.fastcall, this);
  }

  /**
   * todo: Description.
   */
  public set_shooting(shooting: number): void {
    this.mgun.Action(CCar.eWpnFire, shooting);
  }

  /**
   * todo: Description.
   */
  public check_fire_time(): void {
    if (this.state.fire_rep === -1) {
      return;
    }

    if (1000 * this.state.fire_time + this.start_shooting_time >= time_global() && this.state_delaying === false) {
      this.state_delaying = false;
      this.start_delaying_time = time_global() + math.random(-0.2, 0.2) * 1000 * this.state.fire_time;

      return;
    } else {
      this.state_delaying = true;
    }

    if (this.start_delaying_time + 1000 * this.state.fire_rep >= time_global() && this.state_delaying === true) {
      this.state_delaying = true;
      this.start_shooting_time = time_global();
    } else {
      this.state_delaying = false;
    }
  }

  /**
   * todo: Description.
   */
  public save(): void {}

  /**
   * todo: Description.
   */
  public rot_to_firedir(direction: Optional<XR_vector>): void {
    if (direction) {
      this.mgun.SetParam(CCar.eWpnDesiredPos, direction);
    }
  }

  /**
   * todo: Description.
   */
  public rot_to_firepoint(pt: Optional<XR_vector>): void {
    if (pt) {
      this.mgun.SetParam(CCar.eWpnDesiredPos, pt);
    }
  }

  /**
   * todo: Description.
   */
  public fastcall(): boolean {
    if (isActiveSection(this.object, this.state.section)) {
      this.set_shooting(0);

      return true;
    }

    return this.fast_update();
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }

    if (this.destroyed) {
      switchObjectSchemeToSection(this.object, this.state.ini!, NIL);

      return;
    }

    this.check_fire_time();
  }

  /**
   * todo: Description.
   */
  public fast_update(): boolean {
    if (this.mgun.GetfHealth() <= 0) {
      this.destroy_car();

      return true;
    }

    const cur_time: number = time_global();

    if (this.fc_upd_num < def_max_fc_upd_num) {
      const last_upd = this.fc_last_upd_tm;

      if (last_upd !== -1) {
        const n = this.fc_upd_num;

        if (n < 3000) {
          this.fc_upd_avg = (this.fc_upd_avg * n + (cur_time - last_upd)) / (n + 1);
          this.fc_upd_num = n + 1;
        } else {
          this.fc_upd_num = 1;
        }
      }

      this.fc_last_upd_tm = cur_time;
    }

    if (this.state_cannon === state_cannon_stop && this.state_firetarget === state_none) {
      if (isObjectScriptCaptured(this.object) && !this.object.action()) {
        this.destroy_car();

        return true;
      }

      return false;
    }

    if (this.hasWeapon) {
      if (this.on_target_vis && this.on_target_vis.v1.alive() && this.mgun.IsObjectVisible(this.on_target_vis.v1)) {
        const new_section = pickSectionFromCondList(registry.actor, this.object, this.on_target_vis.condlist);

        if (new_section) {
          switchObjectSchemeToSection(this.object, this.state.ini!, new_section);
        }
      }

      if (this.on_target_nvis && this.on_target_nvis.v1.alive() && !this.mgun.IsObjectVisible(this.on_target_nvis.v1)) {
        const new_section = pickSectionFromCondList(registry.actor, this.object, this.on_target_nvis.condlist);

        if (new_section) {
          switchObjectSchemeToSection(this.object, this.state.ini!, new_section);
        }
      }

      if (this.state_firetarget === state_firetarget_points) {
        const fire_angle = this.angle_xz(this.object, this.path_fire_point!, this.start_direction);
        const can_rotate =
          fire_angle <= (this.state.fire_angle * math.pi) / 360 &&
          fire_angle >= -((this.state.fire_angle * math.pi) / 360);

        if (can_rotate) {
          this.rot_to_firepoint(this.path_fire_point);
          if (this.state_delaying) {
            if (this.state_shooting !== state_none && this.state.auto_fire === true) {
              this.state_shooting = state_none;
              this.set_shooting(this.state_shooting);
            }
          } else {
            if (this.state_shooting === state_none) {
              this.state_shooting = state_shooting_on;
              this.set_shooting(this.state_shooting);
            }
          }
        }
      } else if (this.state_firetarget === state_firetarget_enemy) {
        const fire_angle = this.angle_xz(this.object, this.target_obj!.position(), this.start_direction);
        const can_rotate =
          fire_angle <= (this.state.fire_angle * math.pi) / 360 &&
          fire_angle >= -((this.state.fire_angle * math.pi) / 360);
        const object_visible =
          this.mgun.IsObjectVisible(this.target_obj!) || this.state.shoot_only_on_visible === false;

        if (
          this.target_obj!.alive() &&
          this.object.position().distance_to_sqr(this.target_obj!.position()) <= this.fire_range_sqr &&
          object_visible &&
          can_rotate
        ) {
          if (!this.state_delaying) {
            this.target_fire_pt = this.target_obj!.position();
            if (this.target_obj!.id() !== registry.actor.id()) {
              if (this.target_obj!.target_body_state() === move.crouch) {
                this.target_fire_pt.y = this.target_fire_pt.y + 0.5;
              } else if (!isHeavilyWounded(this.target_obj!.id())) {
                this.target_fire_pt.y = this.target_fire_pt.y + 1.2;
              } else {
                this.target_fire_pt.y = this.target_fire_pt.y + 0.1;
              }
            } else {
              this.target_fire_pt.y = this.target_fire_pt.y + 1.0;
            }

            this.rot_to_firepoint(this.target_fire_pt);

            if (this.mgun.CanHit()) {
              if (this.state_shooting === state_none && this.state.auto_fire === true) {
                this.state_shooting = state_shooting_on;
                this.set_shooting(this.state_shooting);
              }
            } else {
              if (this.state_shooting !== state_none) {
                this.state_shooting = state_none;
                this.set_shooting(this.state_shooting);
              }
            }
          } else {
            this.state_shooting = state_none;
            this.set_shooting(this.state_shooting);
          }
        } else {
          if (this.state_shooting !== state_none || !can_rotate || this.state_delaying) {
            this.state_shooting = state_none;
            this.set_shooting(this.state_shooting);
            this.rot_to_firedir(this.start_look_pos);
          }

          if (this.fire_track_target !== null) {
            this.target_fire_pt = this.target_obj!.position();
            this.target_fire_pt.y = this.target_fire_pt.y + 1.0;
            this.rot_to_firepoint(this.target_fire_pt);
          }
        }
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public destroy_car(): void {
    this.state_cannon = state_none;
    this.state_firetarget = state_none;
    this.state_shooting = state_none;
    this.mgun.Action(CCar.eWpnAutoFire, 0);
    this.set_shooting(this.state_shooting);

    scriptReleaseObject(this.object, MinigunManager.name);

    if (this.state.on_death_info !== null) {
      registry.actor.give_info_portion(this.state.on_death_info);
    }

    this.destroyed = true;
  }

  /**
   * todo: Description.
   */
  public angle_xz(npc: XR_game_object, target_pos: XR_vector, start_direction: XR_vector): number {
    const dir1 = start_direction;

    dir1.y = 0;

    const dir2 = new vector().set(target_pos.x, target_pos.y, target_pos.z).sub(npc.position());

    dir2.y = 0;

    return yaw(dir1, dir2);
  }
}
