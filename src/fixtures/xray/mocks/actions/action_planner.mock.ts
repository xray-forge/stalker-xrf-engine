import {
  XR_action_base,
  XR_action_planner,
  XR_game_object,
  XR_property_evaluator,
  XR_property_storage,
  XR_world_state,
} from "xray16";

import { Optional, TNumberId } from "@/engine/lib/types";
import { MockActionBase, mockActionBase } from "@/fixtures/xray";
import { mockStalkerIds } from "@/fixtures/xray/mocks/constants/stalker_ids.mock";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";
import { MockPropertyEvaluator } from "@/fixtures/xray/mocks/PropertyEvaluator.mock";

export class MockActionPlanner extends MockLuabindClass {
  public object!: XR_game_object;
  public storage!: XR_property_storage;

  public evaluators: Record<TNumberId, XR_property_evaluator> = {};
  public actions: Record<TNumberId, XR_action_base> = {};
  public goalWorldState: Optional<XR_world_state> = null;

  public isInitialized: boolean = false;

  public initialized(): boolean {
    return this.isInitialized;
  }

  public update(): void {}

  public setup(object: XR_game_object): void {
    this.object = object;
  }

  public add_evaluator(id: TNumberId, evaluator: XR_property_evaluator): void {
    if (!id) {
      throw new Error("Unexpected id.");
    }

    this.evaluators[id] = evaluator;
  }

  public add_action(id: TNumberId, actionBase: XR_action_base): void {
    if (!id) {
      throw new Error("Unexpected id.");
    }

    this.actions[id] = actionBase;
  }

  public set_goal_world_state(state: XR_world_state): void {
    this.goalWorldState = state;
  }

  public action(id: TNumberId): Optional<MockActionBase> {
    return (this.actions[id] as unknown as MockActionBase) || null;
  }

  public evaluator(id: TNumberId): Optional<MockPropertyEvaluator> {
    return (this.evaluators[id] as unknown as MockPropertyEvaluator) || null;
  }
}

/**
 * Mock action planner object.
 */
export function mockActionPlanner(): XR_action_planner {
  return new MockActionPlanner() as unknown as XR_action_planner;
}

/**
 * Mock action planner object.
 */
export function mockDefaultActionPlanner(): XR_action_planner {
  const actionPlanner: MockActionPlanner = new MockActionPlanner();

  actionPlanner.add_action(mockStalkerIds.action_alife_planner, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_gather_items, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_anomaly_planner, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_danger_planner, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_accomplish_task, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_combat_planner, mockActionBase());

  return actionPlanner as unknown as XR_action_planner;
}
