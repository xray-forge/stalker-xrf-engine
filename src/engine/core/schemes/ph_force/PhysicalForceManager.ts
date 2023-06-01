import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemePhysicalForceState } from "@/engine/core/schemes/ph_force/ISchemePhysicalForceState";
import { Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalForceManager extends AbstractSchemeManager<ISchemePhysicalForceState> {
  public time: number = 0;
  public process: boolean = false;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    if (this.state.delay !== 0) {
      this.time = time_global() + this.state.delay;
    }

    this.process = false;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }

    if (this.process === true) {
      return;
    }

    if (this.state.delay !== null) {
      if (time_global() - this.time < 0) {
        return;
      }
    }

    const direction: Vector = this.state.point.sub(this.object.position());

    direction.normalize();
    this.object.set_const_force(direction, this.state.force, this.state.time);
    this.process = true;
  }
}
