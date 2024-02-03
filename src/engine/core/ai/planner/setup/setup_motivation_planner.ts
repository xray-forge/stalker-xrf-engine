import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state";
import { ActionStateToIdle } from "@/engine/core/ai/state/state/ActionStateToIdle";
import { EvaluatorStateIdleAlife } from "@/engine/core/ai/state/state/EvaluatorStateIdleAlife";
import { EvaluatorStateIdleCombat } from "@/engine/core/ai/state/state/EvaluatorStateIdleCombat";
import { EvaluatorStateIdleItems } from "@/engine/core/ai/state/state/EvaluatorStateIdleItems";
import { EvaluatorStateLogicActive } from "@/engine/core/ai/state/state/EvaluatorStateLogicActive";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP planner of stalker motivation.
 * Merges existing C++ logic with custom scripted logics and scripted state manager.
 *
 * @param planner - motivation action planner to modify logics
 * @param stateManager - state manager controlling animation/state of objects from lua side
 */
export function setupStalkerMotivationPlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  planner.add_evaluator(EEvaluatorId.IS_STATE_IDLE_COMBAT, new EvaluatorStateIdleCombat(stateManager));
  planner.add_evaluator(EEvaluatorId.IS_STATE_IDLE_ALIFE, new EvaluatorStateIdleAlife(stateManager));
  planner.add_evaluator(EEvaluatorId.IS_STATE_IDLE_ITEMS, new EvaluatorStateIdleItems(stateManager));
  planner.add_evaluator(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, new EvaluatorStateLogicActive(stateManager));

  const actionCombatStateToIdle: ActionStateToIdle = new ActionStateToIdle(stateManager, "ActionToIdleCombat");

  actionCombatStateToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, false));
  actionCombatStateToIdle.add_effect(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));

  planner.add_action(EActionId.STATE_TO_IDLE_COMBAT, actionCombatStateToIdle);

  const actionItemsToIdle: ActionStateToIdle = new ActionStateToIdle(stateManager, "ActionToIdleItems");

  actionItemsToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ITEMS, false));
  actionItemsToIdle.add_precondition(new world_property(EEvaluatorId.ITEMS, true));
  actionItemsToIdle.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
  actionItemsToIdle.add_effect(new world_property(EEvaluatorId.IS_STATE_IDLE_ITEMS, true));

  planner.add_action(EActionId.STATE_TO_IDLE_ITEMS, actionItemsToIdle);

  const actionAlifeToIdle: ActionStateToIdle = new ActionStateToIdle(stateManager, "ActionToIdleAlife");

  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.DANGER, false));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.ITEMS, false));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ALIFE, false));
  actionAlifeToIdle.add_effect(new world_property(EEvaluatorId.IS_STATE_IDLE_ALIFE, true));

  planner.add_action(EActionId.STATE_TO_IDLE_ALIFE, actionAlifeToIdle);

  planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ALIFE, true));
  planner.action(EActionId.COMBAT).add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));
  planner.action(EActionId.ANOMALY).add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));
  planner.action(EActionId.DANGER).add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));

  planner.action(EActionId.GATHER_ITEMS).add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ITEMS, true));
}
