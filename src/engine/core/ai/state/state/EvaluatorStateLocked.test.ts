import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockActionPlanner, MockGameObject, MockPropertyEvaluator, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EvaluatorStateLocked } from "@/engine/core/ai/state/state/EvaluatorStateLocked";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";

describe("EvaluatorStateLocked", () => {
  it("waits for the state planner to initialize before reporting a lock", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const evaluator: EvaluatorStateLocked = new EvaluatorStateLocked(stateManager);

    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("reports a lock from either the weapon state or a body turn", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;
    const weaponLocked: MockPropertyEvaluator = MockPropertyEvaluator.create();
    const evaluator: EvaluatorStateLocked = new EvaluatorStateLocked(stateManager);

    planner.isInitialized = true;
    jest.spyOn(weaponLocked, "evaluate").mockReturnValue(false);
    jest.spyOn(object, "is_body_turning").mockReturnValue(false);
    planner.add_evaluator(EStateEvaluatorId.WEAPON_LOCKED, weaponLocked);
    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "is_body_turning").mockReturnValue(true);

    expect(evaluator.evaluate()).toBe(true);

    jest.spyOn(object, "is_body_turning").mockReturnValue(false);
    jest.spyOn(weaponLocked, "evaluate").mockReturnValue(true);

    expect(evaluator.evaluate()).toBe(true);
  });
});
