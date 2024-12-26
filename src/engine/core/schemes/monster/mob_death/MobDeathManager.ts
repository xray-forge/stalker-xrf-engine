import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { EScheme, GameObject, Optional } from "@/engine/lib/types";

/**
 * Handler to manage monster death events.
 */
export class MobDeathManager extends AbstractSchemeManager<ISchemeMobDeathState> {
  /**
   * Handle monster death event.
   * Interop with scheme logics and memoize killer info.
   *
   * @param victim - monster who has been killed
   * @param killer - target who killed the monster
   */
  public override onDeath(victim: GameObject, killer: Optional<GameObject>): void {
    let deathState: Optional<ISchemeMobDeathState> = registry.objects.get(victim.id())[
      EScheme.DEATH
    ] as Optional<ISchemeMobDeathState>;

    // todo: Probably always true for monsters since we init different state in this scheme.
    if (!deathState) {
      deathState = {} as ISchemeMobDeathState;
      registry.objects.get(victim.id())[EScheme.DEATH] = deathState;
    }

    deathState.killerId = killer === null ? -1 : killer.id();

    trySwitchToAnotherSection(victim, this.state);
  }
}
