import { device, time_global, vector, XR_game_object, XR_ini_file, XR_physics_joint, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { vectorRotateY } from "@/mod/scripts/utils/physics";

export class ActionOscillate extends AbstractSchemeAction {
  public static SCHEME_SECTION: string = "ph_oscillate";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, state, new ActionOscillate(npc, state));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    const state: IStoredObject = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(
      object,
      ini,
      scheme,
      section
    );

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
    state.joint = getConfigString(ini, section, "joint", object, true, gulag_name);

    if (state.joint === null) {
      abort("Invalid joint definition for object %s", object.name());
    }

    state.period = getConfigNumber(ini, section, "period", object, true, 0);
    state.force = getConfigNumber(ini, section, "force", object, true, 0);

    if (state.period === null || state.force === null) {
      abort("[ActionOscillate] Error : Force or period not defined");
    }

    state.angle = getConfigNumber(ini, section, "correct_angle", object, false, 0);

    if (state.angle === null) {
      state.angle = 0;
    }
  }

  public time: number = 0;
  public coefficient: number = 0;
  public dir: XR_vector = new vector().set(math.random(), 0, math.random()).normalize();
  public joint: Optional<XR_physics_joint> = null;
  public pause: boolean = false;

  public reset_scheme(): void {
    this.time = device().time_global();
    this.dir = new vector().set(math.random(), 0, math.random()).normalize();
    this.coefficient = this.state.force / this.state.period;
    this.joint = this.object.get_physics_shell()!.get_joint_by_bone_name(this.state.joint);
    this.time = time_global();
    this.pause = false;
  }

  public update(delta: number): void {
    const c_time = time_global();

    if (this.pause === true) {
      if (c_time - this.time < this.state.period * 0.5) {
        return;
      }

      this.time = c_time;
      this.pause = false;
    }

    if (c_time - this.time >= this.state.period) {
      this.dir.x = -this.dir.x;
      this.dir.z = -this.dir.z;
      this.dir = vectorRotateY(new vector().set(-this.dir.x, 0, -this.dir.z), this.state.angle);
      this.time = c_time;
      this.pause = true;

      return;
    }

    const force = (c_time - this.time) * this.coefficient;

    this.object.set_const_force(this.dir, force, 2);
  }
}
