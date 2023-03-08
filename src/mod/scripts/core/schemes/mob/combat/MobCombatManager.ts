import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeMobCombatState } from "@/mod/scripts/core/schemes/mob/combat/ISchemeMobCombatState";

/**
 * todo;
 */
export class MobCombatManager extends AbstractSchemeManager<ISchemeMobCombatState> {
  /**
   * todo;
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
