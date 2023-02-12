import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { assign_storage_and_bind, subscribe_action_for_events } from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionCompanionActivity } from "@/mod/scripts/core/logic/actions/ActionCompanionActivity";
import { EvaluatorNeedCompanion } from "@/mod/scripts/core/logic/evaluators/EvaluatorNeedCompanion";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("ActionSchemeCompanion");

export class ActionSchemeCompanion extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "companion";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
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

    subscribe_action_for_events(npc, storage, actionCompanionActivity);

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.need_companion, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    additional: string
  ): void {
    const st = assign_storage_and_bind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.behavior = 0; // beh_walk_simple
  }
}
