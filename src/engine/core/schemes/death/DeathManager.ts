import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeDeathState } from "@/engine/core/schemes/death/ISchemeDeathState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { ClientObject, EScheme, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export class DeathManager extends AbstractSchemeManager<ISchemeDeathState> {
  /**
   * todo: Description.
   */
  public override onDeath(victim: ClientObject, who: Optional<ClientObject>): void {
    (registry.objects.get(victim.id())[EScheme.DEATH] as ISchemeDeathState).killer = who === null ? -1 : who.id();

    if (this.state.info) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info);
    }

    if (this.state.info2) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info2);
    }
  }
}
