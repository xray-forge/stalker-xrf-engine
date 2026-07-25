import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorSeeBestEnemyEnemy } from "@/engine/core/schemes/stalker/combat_camper/evaluator/EvaluatorSeeBestEnemyEnemy";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createEvaluator(): {
  evaluator: EvaluatorSeeBestEnemyEnemy;
  object: GameObject;
  state: ISchemeCombatState;
} {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCombatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, {
    lastSeenEnemyAtPosition: null,
  });
  const evaluator: EvaluatorSeeBestEnemyEnemy = new EvaluatorSeeBestEnemyEnemy(state);

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, object, state };
}

describe("EvaluatorSeeBestEnemyEnemy", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should not see enemy when there is none", () => {
    const { evaluator, state } = createEvaluator();

    expect(evaluator.evaluate()).toBe(false);
    expect(state.lastSeenEnemyAtPosition).toBeNull();
  });

  it("should not see enemy when object is dead", () => {
    const { evaluator, object, state } = createEvaluator();

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(evaluator.evaluate()).toBe(false);
    expect(state.lastSeenEnemyAtPosition).toBeNull();
  });

  it("should not see enemy that is not visible", () => {
    const { evaluator, object, state } = createEvaluator();

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    jest.spyOn(object, "see").mockImplementation(() => false);

    expect(evaluator.evaluate()).toBe(false);
    expect(state.lastSeenEnemyAtPosition).toBeNull();
  });

  it("should remember position of visible enemy", () => {
    const { evaluator, object, state } = createEvaluator();
    const enemy: GameObject = MockGameObject.mock({ position: MockVector.create(3, 4, 5) });

    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);
    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(evaluator.evaluate()).toBe(true);
    expect(state.lastSeenEnemyAtPosition).toEqual(MockVector.create(3, 4, 5));
  });
});
