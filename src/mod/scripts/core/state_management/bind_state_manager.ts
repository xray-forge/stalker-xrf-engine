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

/**
 *
 * function bind_manager(object)
 *    local manager = object:motivation_action_manager()
 *
 *    local properties    = {}
 *    properties["state_mgr_idle_combat"]    = xr_evaluators_id.state_mgr + 1
 *    properties["state_mgr_idle_alife"]        = xr_evaluators_id.state_mgr + 2
 *    properties["state_mgr_idle_smartcover"]    = xr_evaluators_id.state_mgr + 3
 *    properties["state_mgr_logic_active"]    = xr_evaluators_id.state_mgr + 4
 *    properties["state_mgr_idle_items"]        = xr_evaluators_id.state_mgr + 5
 *
 *    local operators        = {}
 *    operators["state_mgr_to_idle_combat"]    = xr_actions_id.state_mgr + 1
 *    operators["state_mgr_to_idle_alife"]    = xr_actions_id.state_mgr + 2
 *    operators["state_mgr_to_idle_items"]    = xr_actions_id.state_mgr + 3
 *
 *    local state_manager = state_mgr.state_manager(object)
 *
 *    manager:add_evaluator(properties["state_mgr_idle_combat"],        evaluator_state_mgr_idle("state_mgr_idle_combat", state_manager))
 *    manager:add_evaluator(properties["state_mgr_idle_alife"],        evaluator_state_mgr_idle_alife("state_mgr_idle_alife", state_manager))
 *    manager:add_evaluator(properties["state_mgr_idle_items"],        evaluator_state_mgr_idle_items("state_mgr_idle_items", state_manager))
 *    manager:add_evaluator(properties["state_mgr_logic_active"],    evaluator_state_mgr_logic_active("state_mgr_logic_active", state_manager))
 *
 *    local action = this.act_state_mgr_to_idle("state_mgr_to_idle_combat", state_manager)
 *
 *    action:add_precondition        (world_property(properties["state_mgr_idle_combat"],    false))
 *    action:add_effect            (world_property(properties["state_mgr_idle_combat"],    true))
 *
 *    manager:add_action(operators["state_mgr_to_idle_combat"], action)
 *
 *    action = this.act_state_mgr_to_idle("state_mgr_to_idle_items", state_manager)
 *
 *    action:add_precondition        (world_property(properties["state_mgr_idle_items"],    false))
 *    action:add_precondition        (world_property(stalker_ids.property_items, true))
 *    action:add_precondition        (world_property(stalker_ids.property_enemy, false))
 *    action:add_effect            (world_property(properties["state_mgr_idle_items"],    true))
 *
 *    manager:add_action(operators["state_mgr_to_idle_items"], action)
 *
 *    action = this.act_state_mgr_to_idle("state_mgr_to_idle_alife", state_manager)
 *
 *    action:add_precondition        (world_property(stalker_ids.property_enemy,    false))
 *    action:add_precondition        (world_property(stalker_ids.property_danger,false))
 *    action:add_precondition        (world_property(properties["state_mgr_logic_active"], false))
 *    action:add_precondition        (world_property(properties["state_mgr_idle_alife"],    false))
 *    action:add_effect            (world_property(properties["state_mgr_idle_alife"],    true))
 *
 *    manager:add_action(operators["state_mgr_to_idle_alife"], action)
 *
 *    action = manager:action(xr_actions_id.alife)
 *    action:add_precondition(world_property(properties["state_mgr_idle_alife"],true))
 *
 *    action = manager:action(stalker_ids.action_gather_items)
 *    action:add_precondition(world_property(properties["state_mgr_idle_items"],true))
 *
 *    action = manager:action(stalker_ids.action_combat_planner)
 *    action:add_precondition(world_property(properties["state_mgr_idle_combat"],true))
 *
 *    action = manager:action(stalker_ids.action_anomaly_planner)
 *    action:add_precondition(world_property(properties["state_mgr_idle_combat"],true))
 *
 *    action = manager:action(stalker_ids.action_danger_planner)
 *    action:add_precondition(world_property(properties["state_mgr_idle_combat"],true))
 *
 *
 *    return state_manager
 * end
 */
