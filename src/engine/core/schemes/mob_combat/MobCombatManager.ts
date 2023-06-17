import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob_combat/ISchemeMobCombatState";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";

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
        if (trySwitchToAnotherSection(this.object, this.state)) {
          return;
        }
      }
    }
  }
}
