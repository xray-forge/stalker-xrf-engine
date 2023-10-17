import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { EScheme, GameObject, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class DeathManager extends AbstractSchemeManager<ISchemeDeathState> {
  /**
   * todo: Description.
   */
  public override onDeath(victim: GameObject, who: Optional<GameObject>): void {
    (registry.objects.get(victim.id())[EScheme.DEATH] as ISchemeDeathState).killerId = who === null ? -1 : who.id();

    if (this.state.info) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info);
    }

    if (this.state.info2) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info2);
    }
  }
}
