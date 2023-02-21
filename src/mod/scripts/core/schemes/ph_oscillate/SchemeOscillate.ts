import { device, time_global, vector, XR_game_object, XR_ini_file, XR_physics_joint, XR_vector } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { cfg_get_switch_conditions, getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorRotateY } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("SchemeOscillate");

/**
 * todo;
 */
export class SchemeOscillate extends AbstractScheme {
  public static SCHEME_SECTION: EScheme = EScheme.PH_OSCILLATE;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    subscribeActionForEvents(object, state, new SchemeOscillate(object, state));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state: IStoredObject = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
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
