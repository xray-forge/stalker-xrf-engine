import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionLookAround, IActionLookAround } from "@/mod/scripts/core/logic/actions/ActionLookAround";
import { ActionShoot, IActionShoot } from "@/mod/scripts/core/logic/actions/ActionShoot";
import { EvaluatorCombatCamper } from "@/mod/scripts/core/logic/evaluators/EvaluatorCombatCamper";
import { EvaluatorSee } from "@/mod/scripts/core/logic/evaluators/EvaluatorSee";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeCombatCamper");

const prop_enable = evaluators_id.combat_camper_base + 0;
const prop_see = evaluators_id.combat_camper_base + 1;
const act_shoot = action_ids.combat_camper_base + 0;
const act_look_around = action_ids.combat_camper_base + 1;

export class ActionSchemeCombatCamper extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "combat_camper";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject,
    planner?: XR_action_planner
  ): void {
    logger.info("Add to binder:", object.name());

    if (!planner) {
      abort("Expected planner to be provided for add_to_binder method call.");
    }

    const properties = {
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    planner.add_evaluator(
      prop_enable,
      create_xr_class_instance(EvaluatorCombatCamper, EvaluatorCombatCamper.__name, state)
    );
    planner.add_evaluator(prop_see, create_xr_class_instance(EvaluatorSee, EvaluatorSee.__name, state));

    const shootAction: IActionShoot = create_xr_class_instance(ActionShoot, ActionShoot.__name, state);

    shootAction.add_precondition(new world_property(stalker_ids.property_alive, true));
    shootAction.add_precondition(new world_property(stalker_ids.property_enemy, true));
    shootAction.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    shootAction.add_precondition(new world_property(evaluators_id.script_combat, true));
    shootAction.add_precondition(new world_property(prop_enable, true));
    shootAction.add_precondition(new world_property(prop_see, true));
    shootAction.add_effect(new world_property(stalker_ids.property_enemy, false));
    shootAction.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(act_shoot, shootAction);

    const lookAroundAction: IActionLookAround = create_xr_class_instance(
      ActionLookAround,
      ActionLookAround.__name,
      state
    );

    lookAroundAction.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    lookAroundAction.add_precondition(new world_property(evaluators_id.script_combat, true));
    lookAroundAction.add_precondition(new world_property(prop_enable, true));
    lookAroundAction.add_precondition(new world_property(prop_see, false));
    lookAroundAction.add_effect(new world_property(prop_see, true));
    lookAroundAction.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(act_look_around, lookAroundAction);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, lookAroundAction);

    state.camper_combat_action = false;
  }
}
