import { describe, expect, it, jest } from "@jest/globals";

import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { EvaluatorReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/evaluators/EvaluatorReachAnimpoint";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("EvaluatorReachAnimpoint", () => {
  it("should correctly check if reached animpoint position", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);
    const evaluator: EvaluatorReachAnimpoint = new EvaluatorReachAnimpoint(state);

    evaluator.setup(object, MockPropertyStorage.mock());

    state.animpointManager = new AnimpointManager(object, state);

    jest.spyOn(state.animpointManager, "isPositionReached").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(true);

    jest.spyOn(state.animpointManager, "isPositionReached").mockImplementation(() => false);
    expect(evaluator.evaluate()).toBe(false);
  });
});
