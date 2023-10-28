import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/mob_combat_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";

/**
 * Manager to handle combat start event for monsters.
 */
export class MobCombatManager extends AbstractSchemeManager<ISchemeMobCombatState> {
  public override onCombat(): void {
    if (this.state.enabled && this.object.get_enemy() !== null && registry.objects.get(this.object.id()).activeScheme) {
      trySwitchToAnotherSection(this.object, this.state);
    }
  }
}
