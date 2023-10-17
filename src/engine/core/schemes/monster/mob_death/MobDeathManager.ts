import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { EScheme, GameObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Handler to manage monster death events.
 */
export class MobDeathManager extends AbstractSchemeManager<ISchemeMobDeathState> {
  /**
   * When monster was killed.
   *
   * @param victim - monster who has been killed
   * @param who - target who killed the monster
   */
  public override onDeath(victim: GameObject, who: Optional<GameObject>): void {
    const victimId: TNumberId = victim.id();
    let deathState: Optional<ISchemeDeathState> = registry.objects.get(victimId)[
      EScheme.DEATH
    ] as Optional<ISchemeDeathState>;

    // todo: Probably always true for monsters since we init different state in this scheme.
    if (!deathState) {
      deathState = {} as ISchemeDeathState;
      registry.objects.get(victimId)[EScheme.DEATH] = deathState;
    }

    if (who === null) {
      deathState.killerId = -1;
      deathState.killerName = null;
    } else {
      deathState.killerId = who.id();
      deathState.killerName = who.name();
    }

    trySwitchToAnotherSection(victim, this.state);
  }
}
