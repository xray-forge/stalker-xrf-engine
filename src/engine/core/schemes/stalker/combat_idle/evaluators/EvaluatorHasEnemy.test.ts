import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { EAnimationType } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/stalker/combat_idle";
import { EvaluatorHasEnemy } from "@/engine/core/schemes/stalker/combat_idle/evaluators/EvaluatorHasEnemy";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

function mockEvaluator(
  state: ISchemePostCombatIdleState = mockSchemeState(EScheme.POST_COMBAT_IDLE, {
    lastBestEnemyId: null,
    lastBestEnemyName: null,
  } as ISchemePostCombatIdleState)
): EvaluatorHasEnemy {
  const evaluator: EvaluatorHasEnemy = new EvaluatorHasEnemy(state);
  const object: GameObject = MockGameObject.mock();

  evaluator.setup(object, MockPropertyStorage.mock());

  return evaluator;
}

jest.mock("@/engine/core/schemes/stalker/danger/utils");

describe("EvaluatorHasEnemy", () => {
  beforeEach(() => {
    resetRegistry();
    jest.spyOn(Date, "now").mockImplementation(() => 1_000);
  });

  it("should correctly initialize", () => {
    jest.spyOn(Date, "now").mockImplementationOnce(() => 2_000);

    const evaluator: EvaluatorHasEnemy = mockEvaluator();

    expect(evaluator.state.timer);
  });

  it("should correctly ignore for dead objects", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();

    jest.spyOn(evaluator.object, "alive").mockImplementation(() => false);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should correctly ignore non-selectable enemies", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();
    const enemy: GameObject = MockGameObject.mock();

    replaceFunctionMock(canObjectSelectAsEnemy, () => false);

    jest.spyOn(evaluator.object, "best_enemy").mockImplementation(() => enemy);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should correctly handle active enemies", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();
    const enemy: GameObject = MockGameObject.mock();

    replaceFunctionMock(canObjectSelectAsEnemy, () => true);

    jest.spyOn(evaluator.object, "best_enemy").mockImplementation(() => enemy);

    expect(evaluator.state.timer).toBe(1_000);
    expect(evaluator.evaluate()).toBe(true);
    expect(evaluator.state.lastBestEnemyId).toBe(enemy.id());
    expect(evaluator.state.lastBestEnemyName).toBe(enemy.name());
    expect(evaluator.state.timer).toBeNull();
  });

  it("should correctly handle active enemies with timer reset", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();
    const enemy: GameObject = MockGameObject.mock();

    replaceFunctionMock(canObjectSelectAsEnemy, () => true);

    jest.spyOn(evaluator.object, "best_enemy").mockImplementation(() => enemy);

    evaluator.state.timer = null;

    expect(evaluator.evaluate()).toBe(true);
    expect(evaluator.state.lastBestEnemyId).toBeNull();
    expect(evaluator.state.lastBestEnemyName).toBeNull();
    expect(evaluator.state.timer).toBeNull();
  });

  it("should correctly reset timers for actor", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();

    evaluator.state.timer = null;
    evaluator.state.lastBestEnemyId = ACTOR_ID;

    jest.spyOn(Date, "now").mockImplementationOnce(() => 2_000);

    expect(evaluator.evaluate()).toBe(false);
    expect(evaluator.state.timer).toBe(2_000);
  });

  it("should correctly reset timers for generic object", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();
    const enemy: GameObject = MockGameObject.mock();

    registerObject(evaluator.object);

    evaluator.state.timer = null;
    evaluator.state.lastBestEnemyId = enemy.id();
    evaluator.state.lastBestEnemyName = enemy.name();

    jest.spyOn(Date, "now").mockImplementationOnce(() => 2_000);

    expect(evaluator.evaluate()).toBe(true);
    expect(evaluator.state.timer).toBeGreaterThanOrEqual(2_000 + combatConfig.POST_COMBAT_IDLE.MIN * 1_000);
    expect(evaluator.state.timer).toBeLessThanOrEqual(2_000 + combatConfig.POST_COMBAT_IDLE.MAX * 1_000);
  });

  it("should correctly play animation", () => {
    const evaluator: EvaluatorHasEnemy = mockEvaluator();

    registerObject(evaluator.object);

    const state: IRegistryObjectState = registerObject(evaluator.object);

    state.stateManager = new StalkerStateManager(evaluator.object);

    evaluator.state.timer = 999;
    evaluator.state.animation = new StalkerAnimationManager(
      evaluator.object,
      state.stateManager,
      EAnimationType.ANIMATION
    );

    jest.spyOn(evaluator.state.animation, "setState").mockImplementation(jest.fn());

    expect(evaluator.evaluate()).toBe(false);
    expect(evaluator.state.animation.setState).toHaveBeenCalledWith(null);
    expect(evaluator.state.timer).toBe(999);
  });
});
