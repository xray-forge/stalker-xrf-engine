import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { registerObject, registry } from "@/engine/core/database";
import { EScriptCombatType, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorCheckCombat } from "@/engine/core/schemes/stalker/combat/evaluators/EvaluatorCheckCombat";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createEvaluator(base: Partial<ISchemeCombatState> = {}): {
  evaluator: EvaluatorCheckCombat;
  object: GameObject;
  state: ISchemeCombatState;
} {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCombatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, {
    enabled: true,
    scriptCombatType: EScriptCombatType.CAMPER,
    ...base,
  });
  const evaluator: EvaluatorCheckCombat = new EvaluatorCheckCombat(state);

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, object, state };
}

describe("EvaluatorCheckCombat", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should not apply scripted combat without enemy", () => {
    const { evaluator } = createEvaluator();

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not apply scripted combat when disabled", () => {
    const { evaluator, object } = createEvaluator({ enabled: false });

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not apply scripted combat without actor", () => {
    const { evaluator, object } = createEvaluator();

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    registry.actor = null as unknown as GameObject;

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not apply scripted combat without combat type", () => {
    const { evaluator, object } = createEvaluator({ scriptCombatType: null });

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should apply scripted combat with enemy, actor and combat type", () => {
    const { evaluator, object } = createEvaluator();

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(evaluator.evaluate()).toBe(true);
  });
});
