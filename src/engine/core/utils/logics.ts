import { ActionPlanner, GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { EActionId } from "@/engine/core/ai/planner/types/motivator_actions";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { ISchemeCombatState, SchemeCombat } from "@/engine/core/schemes/stalker/combat";
import { getActiveSchemeStateOptimistic, hasActiveScheme, ILogicsOverrides } from "@/engine/core/schemes/state";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";

/**
 * Update active logic of a stalker object, handling combat overrides and switching to another scheme section.
 *
 * @param object - Game object to update logic for.
 * @param state - Registry state containing the active scheme, combat state, and overrides.
 */
export function updateStalkerLogic(object: GameObject, state: IRegistryObjectState): void {
  const actor: GameObject = registry.actor;
  const combatState: ISchemeCombatState = state.combat as ISchemeCombatState;

  if (hasActiveScheme(state) && object.alive()) {
    const manager: ActionPlanner = object.motivation_action_manager();

    let switched: boolean = false;

    if (manager.initialized() && manager.current_action_id() === EActionId.COMBAT) {
      const overrides: Nillable<ILogicsOverrides> = state.overrides;

      if (overrides) {
        if (overrides.onCombat) {
          pickSectionFromCondList(actor, object, overrides.onCombat.condlist);
        }

        if (combatState?.logic) {
          if (!trySwitchToAnotherSection(object, combatState) && overrides.combatType) {
            SchemeCombat.setCombatType(object, actor, overrides);
          } else {
            switched = true;
          }
        }
      } else {
        SchemeCombat.setCombatType(object, actor, combatState);
      }
    }

    if (!switched) {
      trySwitchToAnotherSection(object, getActiveSchemeStateOptimistic(state));
    }
  } else {
    SchemeCombat.setCombatType(object, actor, combatState);
  }
}
