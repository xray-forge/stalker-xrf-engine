import { stalker_ids, world_property, XR_game_object, XR_ini_file } from "xray16";

import { AnyObject } from "@/mod/lib/types";
import { EScheme, ESchemeType, TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { ActionSleeperActivity } from "@/mod/scripts/core/logic/actions/ActionSleeperActivity";
import { EvaluatorNeedSleep } from "@/mod/scripts/core/logic/evaluators/EvaluatorNeedSleep";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { cfg_get_switch_conditions, getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("ActionSleeper");

export class ActionSleeper extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.SLEEPER;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      action_sleeper: action_ids.zmey_sleeper_base + 1,
    };

    const properties = {
      need_sleeper: evaluators_id.zmey_sleeper_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      properties.need_sleeper,
      create_xr_class_instance(EvaluatorNeedSleep, EvaluatorNeedSleep.__name, storage.get(object.id()).sleeper)
    );

    const action = create_xr_class_instance(
      ActionSleeperActivity,
      ActionSleeperActivity.__name,
      storage.get(object.id()).sleeper
    );

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    action.add_precondition(new world_property(properties.need_sleeper, true));
    addCommonPrecondition(action);
    action.add_effect(new world_property(properties.need_sleeper, false));
    action.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_sleeper, action);

    subscribeActionForEvents(object, storage, action);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.need_sleeper, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    logger.info("Set scheme:", object.name());

    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.path_main = getConfigString(ini, section, "path_main", object, true, gulag_name);
    st.wakeable = getConfigBoolean(ini, section, "wakeable", object, false);
    st.path_walk = null;
    st.path_walk_info = null;
    st.path_look = null;
    st.path_look_info = null;
  }
}

export function is_npc_asleep(npc: XR_game_object): boolean {
  return (storage.get(npc.id())!.state_mgr!.animstate as AnyObject).current_state === "sleep";
}
