import { XR_game_object } from "xray16";

import { EScheme, Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeDeathState } from "@/engine/scripts/core/schemes/death/ISchemeDeathState";
import { pickSectionFromCondList } from "@/engine/scripts/utils/config";

/**
 * todo;
 */
export class DeathManager extends AbstractSchemeManager<ISchemeDeathState> {
  /**
   * todo;
   */
  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    (registry.objects.get(victim.id())[EScheme.DEATH] as ISchemeDeathState).killer = who === null ? -1 : who.id();

    if (this.state.info) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info);
    }

    if (this.state.info2) {
      pickSectionFromCondList(registry.actor, this.object, this.state.info2);
    }
  }
}
