import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/ISchemeMobCombatState";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";

/**
 * todo;
 */
export class MobCombatManager extends AbstractSchemeManager<ISchemeMobCombatState> {
  // todo: Is it needed at all?
  public combat_callback(): void {
    if (this.state.enabled && this.object.get_enemy() !== null) {
      if (registry.objects.get(this.object.id()).activeScheme !== null) {
        trySwitchToAnotherSection(this.object, this.state);
      }
    }
  }
}
