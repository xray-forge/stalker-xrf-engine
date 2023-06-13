import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";
import { ClientObject, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalDeathManager extends AbstractSchemeManager<ISchemePhysicalOnDeathState> {
  /**
   * todo: Description.
   */
  public override onDeath(object: ClientObject, who: Optional<ClientObject>): void {
    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
