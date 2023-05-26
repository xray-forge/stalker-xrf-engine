import { game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/ph_on_death/ISchemePhysicalOnDeathState";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalDeathManager extends AbstractSchemeManager<ISchemePhysicalOnDeathState> {
  /**
   * todo: Description.
   */
  public death_callback(object: game_object, who: Optional<game_object>): void {
    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
