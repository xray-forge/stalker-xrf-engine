import { XR_game_object } from "xray16";

import { Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalOnDeathState } from "@/engine/scripts/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";

/**
 * todo;
 */
export class PhysicalDeathManager extends AbstractSchemeManager<ISchemePhysicalOnDeathState> {
  /**
   * todo;
   */
  public death_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
