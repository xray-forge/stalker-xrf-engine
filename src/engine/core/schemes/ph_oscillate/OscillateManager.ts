import { device, time_global, vector, XR_physics_joint, XR_vector } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeOscillateState } from "@/engine/core/schemes/ph_oscillate/ISchemeOscillateState";
import { vectorRotateY } from "@/engine/core/utils/physics";
import { Optional, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class OscillateManager extends AbstractSchemeManager<ISchemeOscillateState> {
  public time: TTimestamp = 0;
  public coefficient: TRate = 0;
  public dir: XR_vector = new vector().set(math.random(), 0, math.random()).normalize();
  public joint: Optional<XR_physics_joint> = null;
  public pause: boolean = false;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.time = device().time_global();
    this.dir = new vector().set(math.random(), 0, math.random()).normalize();
    this.coefficient = this.state.force / this.state.period;
    this.joint = this.object.get_physics_shell()!.get_joint_by_bone_name(this.state.joint);
    this.time = time_global();
    this.pause = false;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const now: TTimestamp = time_global();

    if (this.pause === true) {
      if (now - this.time < this.state.period * 0.5) {
        return;
      }

      this.time = now;
      this.pause = false;
    }

    if (now - this.time >= this.state.period) {
      this.dir.x = -this.dir.x;
      this.dir.z = -this.dir.z;
      this.dir = vectorRotateY(new vector().set(-this.dir.x, 0, -this.dir.z), this.state.angle);
      this.time = now;
      this.pause = true;

      return;
    }

    const force = (now - this.time) * this.coefficient;

    this.object.set_const_force(this.dir, force, 2);
  }
}