import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/scheme/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/scheme/base/trySwitchToAnotherSection";
import { ISchemeMobCombatState } from "@/mod/scripts/core/scheme/mob/combat/ISchemeMobCombatState";

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
