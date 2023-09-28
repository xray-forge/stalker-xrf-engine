import { time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeOscillateState } from "@/engine/core/schemes/physical/ph_oscillate/ISchemeOscillateState";
import { createVector, vectorRotateY } from "@/engine/core/utils/vector";
import { Optional, PhysicsJoint, TRate, TTimestamp, Vector } from "@/engine/lib/types";

/**
 * Manager to handle oscillation of objects with some time period.
 */
export class OscillateManager extends AbstractSchemeManager<ISchemeOscillateState> {
  public time: TTimestamp = 0;
  public coefficient: TRate = 0;
  public dir: Vector = createVector(math.random(), 0, math.random()).normalize();
  public joint: Optional<PhysicsJoint> = null;
  public pause: boolean = false;

  /**
   * todo: Description.
   */
  public override activate(): void {
    this.time = time_global();
    this.dir = createVector(math.random(), 0, math.random()).normalize();
    this.coefficient = this.state.force / this.state.period;
    this.joint = this.object.get_physics_shell()!.get_joint_by_bone_name(this.state.joint);
    this.pause = false;
  }

  /**
   * Handle periodic force applications.
   */
  public update(): void {
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
      this.dir = vectorRotateY(createVector(-this.dir.x, 0, -this.dir.z), this.state.angle);
      this.time = now;
      this.pause = true;

      return;
    }

    const force: TRate = (now - this.time) * this.coefficient;

    this.object.set_const_force(this.dir, force, 2);
  }
}
