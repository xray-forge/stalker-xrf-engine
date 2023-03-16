import { time_global } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/scheme/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/scheme/base/trySwitchToAnotherSection";
import { ISchemePhysicalForceState } from "@/mod/scripts/core/scheme/ph_force/ISchemePhysicalForceState";

/**
 * todo;
 */
export class PhysicalForceManager extends AbstractSchemeManager<ISchemePhysicalForceState> {
  public time: number = 0;
  public process: boolean = false;

  /**
   * todo;
   */
  public override resetScheme(): void {
    if (this.state.delay !== 0) {
      this.time = time_global() + this.state.delay;
    }

    this.process = false;
  }

  /**
   * todo;
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
