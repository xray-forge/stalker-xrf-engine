import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { ActionLookAround, IActionLookAround } from "@/mod/scripts/core/schemes/combat_camper/actions/ActionLookAround";
import { ActionShoot, IActionShoot } from "@/mod/scripts/core/schemes/combat_camper/actions/ActionShoot";
import { EvaluatorCombatCamper } from "@/mod/scripts/core/schemes/combat_camper/evaluator/EvaluatorCombatCamper";
import { EvaluatorSee } from "@/mod/scripts/core/schemes/combat_camper/evaluator/EvaluatorSee";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeCombatCamper");

const prop_enable = evaluators_id.combat_camper_base + 0;
const prop_see = evaluators_id.combat_camper_base + 1;
const act_shoot = action_ids.combat_camper_base + 0;
const act_look_around = action_ids.combat_camper_base + 1;

/**
 * todo
 */
export class SchemeCombatCamper extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_CAMPER;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
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

    subscribeActionForEvents(object, state, lookAroundAction);

    state.camper_combat_action = false;
  }
}
