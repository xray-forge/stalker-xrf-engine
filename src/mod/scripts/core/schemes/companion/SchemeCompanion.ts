import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { ActionCompanionActivity } from "@/mod/scripts/core/schemes/companion/actions/ActionCompanionActivity";
import { EvaluatorNeedCompanion } from "@/mod/scripts/core/schemes/companion/evaluators/EvaluatorNeedCompanion";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("SchemeCompanion");

/**
 * todo;
 */
export class SchemeCompanion extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.COMPANION;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    const operators = {
      action_companion: action_ids.zmey_companion_base + 1,
    };
    const properties = {
      need_companion: evaluators_id.zmey_companion_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = npc.motivation_action_manager();

    actionPlanner.add_evaluator(
      properties.need_companion,
      create_xr_class_instance(EvaluatorNeedCompanion, storage, EvaluatorNeedCompanion.__name)
    );

    const actionCompanionActivity = create_xr_class_instance(
      ActionCompanionActivity,
      npc,
      ActionCompanionActivity.__name,
      storage
    );

    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionCompanionActivity.add_precondition(new world_property(properties.need_companion, true));
    addCommonPrecondition(actionCompanionActivity);
    actionCompanionActivity.add_effect(new world_property(properties.need_companion, false));
    actionCompanionActivity.add_effect(new world_property(properties.state_mgr_logic_active, false));
    actionPlanner.add_action(operators.action_companion, actionCompanionActivity);

    subscribeActionForEvents(npc, storage, actionCompanionActivity);

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.need_companion, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.behavior = 0; // beh_walk_simple
  }
}