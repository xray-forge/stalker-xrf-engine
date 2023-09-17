import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/ISchemeMobDeathState";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
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

    if (trySwitchToAnotherSection(victim, this.state)) {
      return;
    }
  }
}
