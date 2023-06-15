import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeDeathState } from "@/engine/core/schemes/death";
import { ISchemeMobDeathState } from "@/engine/core/schemes/mob_death/ISchemeMobDeathState";
import { ClientObject, EScheme, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class MobDeathManager extends AbstractSchemeManager<ISchemeMobDeathState> {
  /**
   * todo: Description.
   */
  public override onDeath(victim: ClientObject, who: Optional<ClientObject>): void {
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
