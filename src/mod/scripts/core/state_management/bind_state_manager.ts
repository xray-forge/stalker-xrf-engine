import { stalker_ids, world_property, XR_game_object } from "xray16";

import { StateManagerActToIdle } from "@/mod/scripts/core/state_management/state/StateManagerActToIdle";
import { StateManagerEvaIdle } from "@/mod/scripts/core/state_management/state/StateManagerEvaIdle";
import { StateManagerEvaIdleAlife } from "@/mod/scripts/core/state_management/state/StateManagerEvaIdleAlife";
import { StateManagerEvaIdleItems } from "@/mod/scripts/core/state_management/state/StateManagerEvaIdleItems";
import { StateManagerEvaLogicActive } from "@/mod/scripts/core/state_management/state/StateManagerEvaLogicActive";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("bind_state_manager");

export function bind_state_manager(object: XR_game_object): StateManager {
  const planner = object.motivation_action_manager();

  const properties = {
    state_mgr_idle_combat: get_global("xr_evaluators_id").state_mgr + 1,
    state_mgr_idle_alife: get_global("xr_evaluators_id").state_mgr + 2,
    state_mgr_idle_smartcover: get_global("xr_evaluators_id").state_mgr + 3,
    state_mgr_logic_active: get_global("xr_evaluators_id").state_mgr + 4,
    state_mgr_idle_items: get_global("xr_evaluators_id").state_mgr + 5
  };

  const operators = {
    state_mgr_to_idle_combat: get_global("xr_actions_id").state_mgr + 1,
    state_mgr_to_idle_alife: get_global("xr_actions_id").state_mgr + 2,
    state_mgr_to_idle_items: get_global("xr_actions_id").state_mgr + 3
  };

  const state_manager: StateManager = new StateManager(object);

  planner.add_evaluator(
    properties["state_mgr_idle_combat"],
    create_xr_class_instance(StateManagerEvaIdle, "state_mgr_idle_combat", state_manager)
  );
  planner.add_evaluator(
    properties["state_mgr_idle_alife"],
    create_xr_class_instance(StateManagerEvaIdleAlife, "state_mgr_idle_alife", state_manager)
  );
  planner.add_evaluator(
    properties["state_mgr_idle_items"],
    create_xr_class_instance(StateManagerEvaIdleItems, "state_mgr_idle_items", state_manager)
  );
  planner.add_evaluator(
    properties["state_mgr_logic_active"],
    create_xr_class_instance(StateManagerEvaLogicActive, "state_mgr_logic_active", state_manager)
  );

  let action = create_xr_class_instance(StateManagerActToIdle, "state_mgr_to_idle_combat", state_manager);

  action.add_precondition(new world_property(properties["state_mgr_idle_combat"], false));
  action.add_effect(new world_property(properties["state_mgr_idle_combat"], true));
  planner.add_action(operators["state_mgr_to_idle_combat"], action);

  action = create_xr_class_instance(StateManagerActToIdle, "state_mgr_to_idle_items", state_manager);
  action.add_precondition(new world_property(properties["state_mgr_idle_items"], false));
  action.add_precondition(new world_property(stalker_ids.property_items, true));
  action.add_precondition(new world_property(stalker_ids.property_enemy, false));
  action.add_effect(new world_property(properties["state_mgr_idle_items"], true));
  planner.add_action(operators["state_mgr_to_idle_items"], action);

  action = create_xr_class_instance(StateManagerActToIdle, "state_mgr_to_idle_alife", state_manager);
  action.add_precondition(new world_property(stalker_ids.property_enemy, false));
  action.add_precondition(new world_property(stalker_ids.property_danger, false));

  action.add_precondition(new world_property(properties["state_mgr_logic_active"], false));

  action.add_precondition(new world_property(properties["state_mgr_idle_alife"], false));
  action.add_effect(new world_property(properties["state_mgr_idle_alife"], true));
  planner.add_action(operators["state_mgr_to_idle_alife"], action);

  let xr_action = planner.action(get_global("xr_actions_id").alife);

  xr_action.add_precondition(new world_property(properties["state_mgr_idle_alife"], true));

  xr_action = planner.action(stalker_ids.action_gather_items);
  xr_action.add_precondition(new world_property(properties["state_mgr_idle_items"], true));

  xr_action = planner.action(stalker_ids.action_combat_planner);
  xr_action.add_precondition(new world_property(properties["state_mgr_idle_combat"], true));

  xr_action = planner.action(stalker_ids.action_anomaly_planner);
  xr_action.add_precondition(new world_property(properties["state_mgr_idle_combat"], true));

  xr_action = planner.action(stalker_ids.action_danger_planner);
  xr_action.add_precondition(new world_property(properties["state_mgr_idle_combat"], true));

  return state_manager;
}
