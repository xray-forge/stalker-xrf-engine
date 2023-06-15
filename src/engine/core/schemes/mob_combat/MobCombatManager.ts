import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils/trySwitchToAnotherSection";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob_combat/ISchemeMobCombatState";

/**
 * todo;
 */
export class MobCombatManager extends AbstractSchemeManager<ISchemeMobCombatState> {
  /**
   * todo: Description.
   */
  // todo: Is it needed at all?
  public combat_callback(): void {
    if (this.state.enabled && this.object.get_enemy() !== null) {
      if (registry.objects.get(this.object.id()).active_scheme !== null) {
        if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
          return;
        }
      }
    }
  }
}
