import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/physical/ph_on_death/ph_on_death_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { GameObject, Optional } from "@/engine/lib/types";

/**
 * Manager to handle death events for physical objects.
 */
export class PhysicalDeathManager extends AbstractSchemeManager<ISchemePhysicalOnDeathState> {
  public override onDeath(object: GameObject, who: Optional<GameObject>): void {
    if (registry.objects.get(this.object.id()).activeScheme) {
      trySwitchToAnotherSection(object, this.state);
    }
  }
}
