import { describe, expect, it, jest } from "@jest/globals";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject, setPortableStoreValue } from "@/engine/core/database";
import { ISchemeWoundedState, PS_WOUNDED_FIGHT, PS_WOUNDED_STATE } from "@/engine/core/schemes/stalker/wounded";
import { EvaluatorWounded } from "@/engine/core/schemes/stalker/wounded/evaluators/EvaluatorWounded";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockActionPlanner, MockGameObject, MockPropertyStorage } from "@/fixtures/xray";
import { MockPropertyEvaluatorConst } from "@/fixtures/xray/mocks/PropertyEvaluatorConst.mock";

function mockEvaluator(hasEnemy: boolean = false): {
  evaluator: EvaluatorWounded;
  state: ISchemeWoundedState;
  planner: MockActionPlanner;
  object: GameObject;
} {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
  const evaluator: EvaluatorWounded = new EvaluatorWounded(state);
  const planner: MockActionPlanner = new MockActionPlanner();

  registerObject(object);

  state.woundManager = new WoundManager(object, state);

  jest.spyOn(state.woundManager, "update").mockImplementation(jest.fn());

  evaluator.actionPlanner = planner.asMock();
  planner.add_evaluator(EEvaluatorId.ENEMY, new MockPropertyEvaluatorConst(hasEnemy).asMock());

  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, state, planner, object };
}

describe("EvaluatorWounded", () => {
  it("should correctly evaluate whether is wounded", () => {
    const { object, evaluator, state } = mockEvaluator(false);

    expect(evaluator.evaluate()).toBe(false);

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, "test");
    expect(evaluator.evaluate()).toBe(false);

    state.isWoundedInitialized = true;
    expect(evaluator.evaluate()).toBe(true);

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, null);
    expect(evaluator.evaluate()).toBe(false);

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, "wounded");
    expect(evaluator.evaluate()).toBe(true);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => false);
    jest.spyOn(object, "critically_wounded").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(false);
  });

  it("should correctly evaluate whether is wounded if has wounded fight", () => {
    const { object, evaluator, state } = mockEvaluator(true);

    state.isWoundedInitialized = true;

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, "wounded");
    expect(evaluator.evaluate()).toBe(true);

    setPortableStoreValue(object.id(), PS_WOUNDED_FIGHT, "true");
    expect(evaluator.evaluate()).toBe(false);
  });
});
