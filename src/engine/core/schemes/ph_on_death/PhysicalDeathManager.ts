import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalDeathManager extends AbstractSchemeManager<ISchemePhysicalOnDeathState> {
  /**
   * todo: Description.
   */
  public death_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
