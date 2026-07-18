import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";
import { getSchemeStateByKey, setSchemeStateByKey } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/lib/types";

/**
 * Handler to manage monster death events.
 */
export class MobDeathManager extends AbstractSchemeManager<ISchemeMobDeathState> {
  /**
   * Handle monster death event.
   * Interop with scheme logics and memoize killer info.
   *
   * @param victim - Monster who has been killed.
   * @param killer - Target who killed the monster.
   */
  public override onDeath(victim: GameObject, killer: Nillable<GameObject>): void {
    const state: IRegistryObjectState = registry.objects.get(victim.id());

    let deathState: Nillable<ISchemeMobDeathState> = getSchemeStateByKey(state, EScheme.DEATH);

    // todo: Probably always true for monsters since we init different state in this scheme.
    if (!deathState) {
      deathState = {} as ISchemeMobDeathState;
      setSchemeStateByKey(state, EScheme.DEATH, deathState);
    }

    deathState.killerId = killer ? killer.id() : -1;

    trySwitchToAnotherSection(victim, this.state);
  }
}
