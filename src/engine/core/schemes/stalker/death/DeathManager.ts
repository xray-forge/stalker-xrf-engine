import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { EScheme, GameObject, Optional } from "@/engine/lib/types";

/**
 * Handle death event and interop with scheme logics on stalker dying.
 */
export class DeathManager extends AbstractSchemeManager<ISchemeDeathState> {
  /**
   * Handle stalker death event.
   * Interop with scheme logics and memoize killer info.
   *
   * @param victim - game object stalker dying
   * @param killer - game object of stalker killer
   */
  public override onDeath(victim: GameObject, killer: Optional<GameObject>): void {
    (registry.objects.get(victim.id())[EScheme.DEATH] as ISchemeDeathState).killerId =
      killer === null ? -1 : killer.id();

    if (this.state.info) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info);
    }

    if (this.state.info2) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info2);
    }
  }
}
