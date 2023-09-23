import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/ISchemeMobCombatState";
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
