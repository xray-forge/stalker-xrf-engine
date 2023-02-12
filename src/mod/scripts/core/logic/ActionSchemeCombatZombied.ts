import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { subscribe_action_for_events } from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionZombieGoToDanger } from "@/mod/scripts/core/logic/actions/ActionZombieGoToDanger";
import { ActionZombieShoot } from "@/mod/scripts/core/logic/actions/ActionZombieShoot";
import { EvaluatorCombatZombied } from "@/mod/scripts/core/logic/evaluators/EvaluatorCombatZombied";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeCombatZombied");

export class ActionSchemeCombatZombied extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "combat_zombied";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject,
    planner?: XR_action_planner
  ): void {
    if (!planner) {
      abort("Expected planner to be provided for add_to_binder method call.");
    }

    const properties = {
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    planner.add_evaluator(
      evaluators_id.combat_zombied_base,
      create_xr_class_instance(EvaluatorCombatZombied, EvaluatorCombatZombied.__name, storage.get(object.id()))
    );

    const actionZombieShoot = create_xr_class_instance(ActionZombieShoot, ActionZombieShoot.__name, state);

    actionZombieShoot.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieShoot.add_precondition(new world_property(evaluators_id.combat_zombied_base, true));
    actionZombieShoot.add_precondition(new world_property(evaluators_id.script_combat, true));
    actionZombieShoot.add_effect(new world_property(stalker_ids.property_enemy, false));
    actionZombieShoot.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(action_ids.combat_zombied_base, actionZombieShoot);

    subscribe_action_for_events(object, state, actionZombieShoot);

    const actionZombieGoToDanger = create_xr_class_instance(
      ActionZombieGoToDanger,
      ActionZombieGoToDanger.__name,
      state
    );

    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieGoToDanger.add_precondition(new world_property(evaluators_id.combat_zombied_base, true));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_danger, true));
    actionZombieGoToDanger.add_effect(new world_property(stalker_ids.property_danger, false));
    actionZombieGoToDanger.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(action_ids.combat_zombied_base + 1, actionZombieGoToDanger);

    subscribe_action_for_events(object, state, actionZombieGoToDanger);
  }
}
