import { stalker_ids, world_property, XR_game_object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { ActionStateToIdle } from "@/engine/core/objects/state/state/ActionStateToIdle";
import { EvaluatorStateIdle } from "@/engine/core/objects/state/state/EvaluatorStateIdle";
import { EvaluatorStateIdleAlife } from "@/engine/core/objects/state/state/EvaluatorStateIdleAlife";
import { EvaluatorStateIdleItems } from "@/engine/core/objects/state/state/EvaluatorStateIdleItems";
import { EvaluatorStateLogicActive } from "@/engine/core/objects/state/state/EvaluatorStateLogicActive";
import { EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * @param object
 */
export function addStateManager(object: XR_game_object): StalkerStateManager {
  const planner = object.motivation_action_manager();

  const stateManager: StalkerStateManager = new StalkerStateManager(object);

  planner.add_evaluator(EEvaluatorId.state_mgr_idle_combat, new EvaluatorStateIdle(stateManager));
  planner.add_evaluator(EEvaluatorId.state_mgr_idle_alife, new EvaluatorStateIdleAlife(stateManager));
  planner.add_evaluator(EEvaluatorId.state_mgr_idle_items, new EvaluatorStateIdleItems(stateManager));
  planner.add_evaluator(EEvaluatorId.state_mgr_logic_active, new EvaluatorStateLogicActive(stateManager));

  let action = new ActionStateToIdle(stateManager, "CombatToIdle");

  action.add_precondition(new world_property(EEvaluatorId.state_mgr_idle_combat, false));
  action.add_effect(new world_property(EEvaluatorId.state_mgr_idle_combat, true));
  planner.add_action(EActionId.state_mgr_to_idle_combat, action);

  action = new ActionStateToIdle(stateManager, "ItemsToIdle");

  action.add_precondition(new world_property(EEvaluatorId.state_mgr_idle_items, false));
  action.add_precondition(new world_property(stalker_ids.property_items, true));
  action.add_precondition(new world_property(stalker_ids.property_enemy, false));
  action.add_effect(new world_property(EEvaluatorId.state_mgr_idle_items, true));
  planner.add_action(EActionId.state_mgr_to_idle_items, action);

  action = new ActionStateToIdle(stateManager, "DangerToIdle");

  action.add_precondition(new world_property(stalker_ids.property_enemy, false));
  action.add_precondition(new world_property(stalker_ids.property_danger, false));
  action.add_precondition(new world_property(EEvaluatorId.state_mgr_logic_active, false));
  action.add_precondition(new world_property(EEvaluatorId.state_mgr_idle_alife, false));
  action.add_effect(new world_property(EEvaluatorId.state_mgr_idle_alife, true));

  planner.add_action(EActionId.state_mgr_to_idle_alife, action);

  planner.action(EActionId.alife).add_precondition(new world_property(EEvaluatorId.state_mgr_idle_alife, true));

  planner
    .action(stalker_ids.action_gather_items)
    .add_precondition(new world_property(EEvaluatorId.state_mgr_idle_items, true));

  planner
    .action(stalker_ids.action_combat_planner)
    .add_precondition(new world_property(EEvaluatorId.state_mgr_idle_combat, true));

  planner
    .action(stalker_ids.action_anomaly_planner)
    .add_precondition(new world_property(EEvaluatorId.state_mgr_idle_combat, true));

  planner
    .action(stalker_ids.action_danger_planner)
    .add_precondition(new world_property(EEvaluatorId.state_mgr_idle_combat, true));

  return stateManager;
}
