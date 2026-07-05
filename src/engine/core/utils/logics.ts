import { ActionPlanner, GameObject } from "xray16/alias";

import { EActionId } from "@/engine/core/ai/planner/types/motivator_actions";
import { IBaseSchemeState, ILogicsOverrides, IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeCombatState, SchemeCombat } from "@/engine/core/schemes/stalker/combat";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { Nillable } from "@/engine/lib/types";

/**
 * Update active logic of a stalker object, handling combat overrides and switching to another scheme section.
 *
 * @param object - Game object to update logic for.
 */
export function updateStalkerLogic(object: GameObject): void {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());
  const combatState: ISchemeCombatState = state.combat as ISchemeCombatState;

  if (state && state.activeScheme && object.alive()) {
    const actor: GameObject = registry.actor;
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
      trySwitchToAnotherSection(object, state[state.activeScheme] as IBaseSchemeState);
    }
  } else {
    SchemeCombat.setCombatType(object, registry.actor, combatState);
  }
}
