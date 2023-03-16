import { XR_game_object } from "xray16";

import { EScheme, Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/scheme/base/AbstractSchemeManager";
import { ISchemeDeathState } from "@/mod/scripts/core/scheme/death/ISchemeDeathState";
import { pickSectionFromCondList } from "@/mod/scripts/utils/config";

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
