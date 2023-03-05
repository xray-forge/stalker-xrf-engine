import { XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeMobDeathState } from "@/mod/scripts/core/schemes/mob/death/ISchemeMobDeathState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";

/**
 * todo;
 */
export class MobDeathManager extends AbstractSchemeManager<ISchemeMobDeathState> {
  /**
   * todo;
   */
  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    let death = registry.objects.get(victim.id()).death!;

    if (death === null) {
      death = {} as any;
      registry.objects.get(victim.id()).death = death;
    }

    if (who !== null) {
      death.killer = who.id();
      death.killer_name = who.name();
    } else {
      death.killer = -1;
      death.killer_name = null;
    }

    if (trySwitchToAnotherSection(victim, this.state, registry.actor)) {
      return;
    }
  }
}
