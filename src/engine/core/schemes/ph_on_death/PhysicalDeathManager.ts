import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { ClientObject, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalDeathManager extends AbstractSchemeManager<ISchemePhysicalOnDeathState> {
  /**
   * todo: Description.
   */
  public override onDeath(object: ClientObject, who: Optional<ClientObject>): void {
    if (registry.objects.get(this.object.id()).activeScheme) {
      if (trySwitchToAnotherSection(object, this.state)) {
        return;
      }
    }
  }
}
