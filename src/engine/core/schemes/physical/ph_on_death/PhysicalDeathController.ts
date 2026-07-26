import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { AbstractSchemeController } from "@/engine/core/schemes/base";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/physical/ph_on_death/ph_on_death_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";

/**
 * Controller to handle death events for physical objects.
 */
export class PhysicalDeathController extends AbstractSchemeController<ISchemePhysicalOnDeathState> {
  public override onDeath(object: GameObject, who: Nillable<GameObject>): void {
    if (registry.objects.get(this.object.id()).activeScheme) {
      trySwitchToAnotherSection(object, this.state);
    }
  }
}
