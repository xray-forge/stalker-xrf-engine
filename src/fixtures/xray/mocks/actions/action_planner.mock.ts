import { jest } from "@jest/globals";

import {
  ActionBase,
  ActionPlanner,
  GameObject,
  Optional,
  PropertyEvaluator,
  PropertyStorage,
  TNumberId,
  WorldState,
} from "@/engine/lib/types";
import { MockActionBase, mockActionBase } from "@/fixtures/xray/mocks/actions/action_base.mock";
import { mockStalkerIds } from "@/fixtures/xray/mocks/constants/stalker_ids.mock";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";
import { MockPropertyEvaluator } from "@/fixtures/xray/mocks/PropertyEvaluator.mock";

export class MockActionPlanner extends MockLuabindClass {
  public static mock(): ActionPlanner {
    return new MockActionPlanner() as unknown as ActionPlanner;
  }

  public object!: GameObject;
  public storage!: PropertyStorage;

  public evaluators: Record<TNumberId, PropertyEvaluator> = {};
  public actions: Record<TNumberId, ActionBase> = {};
  public goalWorldState: Optional<WorldState> = null;
  public currentActionId: Optional<TNumberId> = null;

  public isInitialized: boolean = false;

  public initialized(): boolean {
    return this.isInitialized;
  }

  public update(): void {}

  public setup(object: GameObject): void {
    this.object = object;
  }

  public add_evaluator = jest.fn((id: TNumberId, evaluator: PropertyEvaluator) => {
    if (!id) {
      throw new Error("Unexpected id.");
    }

    this.evaluators[id] = evaluator;
  });

  public add_action(id: TNumberId, actionBase: ActionBase): void {
    if (!id) {
      throw new Error("Unexpected id.");
    }

    this.actions[id] = actionBase;
  }

  public current_action_id(): Optional<TNumberId> {
    return this.currentActionId;
  }

  public set_goal_world_state(state: WorldState): void {
    this.goalWorldState = state;
  }

  public remove_evaluator(id: TNumberId): void {
    if (!id) {
      throw new Error("Unexpected id.");
    }

    delete this.evaluators[id];
  }

  public action(id: TNumberId): Optional<MockActionBase> {
    return (this.actions[id] as unknown as MockActionBase) || null;
  }

  public evaluator(id: TNumberId): Optional<MockPropertyEvaluator> {
    return (this.evaluators[id] as unknown as MockPropertyEvaluator) || null;
  }

  public show = jest.fn();

  public asMock(): ActionPlanner {
    return this as unknown as ActionPlanner;
  }
}

/**
 * Mock action planner object.
 */
export function mockActionPlanner(): ActionPlanner {
  return new MockActionPlanner() as unknown as ActionPlanner;
}

/**
 * Mock action planner object.
 */
export function mockDefaultActionPlanner(): ActionPlanner {
  const actionPlanner: MockActionPlanner = new MockActionPlanner();

  actionPlanner.add_action(mockStalkerIds.action_alife_planner, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_gather_items, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_anomaly_planner, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_danger_planner, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_accomplish_task, mockActionBase());
  actionPlanner.add_action(mockStalkerIds.action_combat_planner, mockActionBase());
  actionPlanner.add_action(194 /* EActionId.STATE_TO_IDLE_ALIFE */, mockActionBase());

  return actionPlanner as unknown as ActionPlanner;
}
