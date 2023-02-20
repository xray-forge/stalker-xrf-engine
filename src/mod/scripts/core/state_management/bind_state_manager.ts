import { stalker_ids, world_property, XR_game_object } from "xray16";

import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { StateManagerActToIdle } from "@/mod/scripts/core/state_management/state/StateManagerActToIdle";
import { StateManagerEvaIdle } from "@/mod/scripts/core/state_management/state/StateManagerEvaIdle";
import { StateManagerEvaIdleAlife } from "@/mod/scripts/core/state_management/state/StateManagerEvaIdleAlife";
import { StateManagerEvaIdleItems } from "@/mod/scripts/core/state_management/state/StateManagerEvaIdleItems";
import { StateManagerEvaLogicActive } from "@/mod/scripts/core/state_management/state/StateManagerEvaLogicActive";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("bind_state_manager");

export function bind_state_manager(object: XR_game_object): StateManager {
  const planner = object.motivation_action_manager();

  const properties = {
    state_mgr_idle_combat: evaluators_id.state_mgr + 1,
    state_mgr_idle_alife: evaluators_id.state_mgr + 2,
    state_mgr_idle_smartcover: evaluators_id.state_mgr + 3,
    state_mgr_logic_active: evaluators_id.state_mgr + 4,
    state_mgr_idle_items: evaluators_id.state_mgr + 5,
  };

  const operators = {
    state_mgr_to_idle_combat: action_ids.state_mgr + 1,
    state_mgr_to_idle_alife: action_ids.state_mgr + 2,
    state_mgr_to_idle_items: action_ids.state_mgr + 3,
  };

  const stateManager: StateManager = new StateManager(object);

  planner.add_evaluator(
    properties.state_mgr_idle_combat,
    create_xr_class_instance(StateManagerEvaIdle, StateManagerEvaIdle.__name, stateManager)
  );
  planner.add_evaluator(
    properties.state_mgr_idle_alife,
    create_xr_class_instance(StateManagerEvaIdleAlife, StateManagerEvaIdleAlife.__name, stateManager)
  );
  planner.add_evaluator(
    properties.state_mgr_idle_items,
    create_xr_class_instance(StateManagerEvaIdleItems, StateManagerEvaIdleItems.__name, stateManager)
  );
  planner.add_evaluator(
    properties.state_mgr_logic_active,
    create_xr_class_instance(StateManagerEvaLogicActive, StateManagerEvaLogicActive.__name, stateManager)
  );

  let action = create_xr_class_instance(StateManagerActToIdle, StateManagerActToIdle.__name, stateManager);

  action.add_precondition(new world_property(properties.state_mgr_idle_combat, false));
  action.add_effect(new world_property(properties.state_mgr_idle_combat, true));
  planner.add_action(operators.state_mgr_to_idle_combat, action);

  action = create_xr_class_instance(StateManagerActToIdle, StateManagerActToIdle.__name, stateManager);

  action.add_precondition(new world_property(properties.state_mgr_idle_items, false));
  action.add_precondition(new world_property(stalker_ids.property_items, true));
  action.add_precondition(new world_property(stalker_ids.property_enemy, false));
  action.add_effect(new world_property(properties.state_mgr_idle_items, true));
  planner.add_action(operators.state_mgr_to_idle_items, action);

  action = create_xr_class_instance(StateManagerActToIdle, StateManagerActToIdle.__name, stateManager);

  action.add_precondition(new world_property(stalker_ids.property_enemy, false));
  action.add_precondition(new world_property(stalker_ids.property_danger, false));
  action.add_precondition(new world_property(properties.state_mgr_logic_active, false));
  action.add_precondition(new world_property(properties.state_mgr_idle_alife, false));
  action.add_effect(new world_property(properties.state_mgr_idle_alife, true));

  planner.add_action(operators.state_mgr_to_idle_alife, action);

  planner.action(action_ids.alife).add_precondition(new world_property(properties.state_mgr_idle_alife, true));

  planner
    .action(stalker_ids.action_gather_items)
    .add_precondition(new world_property(properties.state_mgr_idle_items, true));

  planner
    .action(stalker_ids.action_combat_planner)
    .add_precondition(new world_property(properties.state_mgr_idle_combat, true));

  planner
    .action(stalker_ids.action_anomaly_planner)
    .add_precondition(new world_property(properties.state_mgr_idle_combat, true));

  planner
    .action(stalker_ids.action_danger_planner)
    .add_precondition(new world_property(properties.state_mgr_idle_combat, true));

  return stateManager;
}