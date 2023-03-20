import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalForceState } from "@/engine/core/schemes/ph_force/ISchemePhysicalForceState";

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

    const dir = this.state.point.sub(this.object.position());

    dir.normalize();
    this.object.set_const_force(dir, this.state.force, this.state.time);
    this.process = true;
  }
}
