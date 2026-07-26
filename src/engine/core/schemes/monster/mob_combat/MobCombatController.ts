import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { AbstractSchemeController } from "@/engine/core/schemes/base";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/mob_combat_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";

/**
 * Controller to handle combat start event for monsters.
 */
export class MobCombatController extends AbstractSchemeController<ISchemeMobCombatState> {
  public override onCombat(): void {
    if (
      this.state.enabled &&
      $isNotNil(this.object.get_enemy()) &&
      registry.objects.get(this.object.id()).activeScheme
    ) {
      trySwitchToAnotherSection(this.object, this.state);
    }
  }
}
