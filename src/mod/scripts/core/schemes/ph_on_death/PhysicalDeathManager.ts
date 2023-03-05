import { XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemePhysicalOnDeathState } from "@/mod/scripts/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";

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
