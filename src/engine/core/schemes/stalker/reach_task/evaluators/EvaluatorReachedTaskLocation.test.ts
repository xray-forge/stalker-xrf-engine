import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyObject } from "xray16/lib";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { EvaluatorReachedTaskLocation } from "@/engine/core/schemes/stalker/reach_task/evaluators/EvaluatorReachedTaskLocation";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/squad", () => ({ getObjectSquad: jest.fn(() => null) }));

function createEvaluator(): { evaluator: EvaluatorReachedTaskLocation; object: GameObject } {
  const object: GameObject = MockGameObject.mock();
  const evaluator: EvaluatorReachedTaskLocation = new EvaluatorReachedTaskLocation();

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return { evaluator, object };
}

/**
 * Report a squad currently reaching the provided target for the evaluated object.
 */
function withReachingSquad(assignedTargetId: number): void {
  replaceFunctionMock(
    getObjectSquad,
    () =>
      ({
        assignedTargetId,
        currentAction: { type: ESquadActionType.REACH_TARGET },
      }) as unknown as Squad
  );
}

describe("EvaluatorReachedTaskLocation", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(getObjectSquad);
    replaceFunctionMock(getObjectSquad, () => null);

    registry.simulator = { object: jest.fn(() => null) } as unknown as AnyObject as typeof registry.simulator;
  });

  it("should not be reaching without squad", () => {
    const { evaluator } = createEvaluator();

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not be reaching for another squad action type", () => {
    const { evaluator } = createEvaluator();

    replaceFunctionMock(
      getObjectSquad,
      () => ({ currentAction: { type: ESquadActionType.STAY_ON_TARGET } }) as unknown as Squad
    );

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not be reaching for missing simulation target", () => {
    const { evaluator } = createEvaluator();

    withReachingSquad(500);

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should not be reaching once target is reached", () => {
    const { evaluator } = createEvaluator();

    withReachingSquad(500);
    registry.simulator = {
      object: jest.fn(() => ({ isReachedBySimulationObject: () => true })),
    } as unknown as AnyObject as typeof registry.simulator;

    expect(evaluator.evaluate()).toBe(false);
  });

  it("should be reaching while target is not reached yet", () => {
    const { evaluator } = createEvaluator();

    withReachingSquad(500);
    registry.simulator = {
      object: jest.fn(() => ({ isReachedBySimulationObject: () => false })),
    } as unknown as AnyObject as typeof registry.simulator;

    expect(evaluator.evaluate()).toBe(true);
  });
});
