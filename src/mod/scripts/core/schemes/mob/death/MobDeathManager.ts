import { XR_game_object } from "xray16";

import { EScheme, Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeDeathState } from "@/mod/scripts/core/schemes/death";
import { ISchemeMobDeathState } from "@/mod/scripts/core/schemes/mob/death/ISchemeMobDeathState";

/**
 * todo;
 */
export class MobDeathManager extends AbstractSchemeManager<ISchemeMobDeathState> {
  /**
   * todo;
   */
  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    let deathState: ISchemeDeathState = registry.objects.get(victim.id())[EScheme.DEATH] as ISchemeDeathState;

    if (deathState === null) {
      deathState = {} as ISchemeDeathState;
      registry.objects.get(victim.id()).death = deathState;
    }

    if (who !== null) {
      deathState.killer = who.id();
      deathState.killer_name = who.name();
    } else {
      deathState.killer = -1;
      deathState.killer_name = null;
    }

    if (trySwitchToAnotherSection(victim, this.state, registry.actor)) {
      return;
    }
  }
}
