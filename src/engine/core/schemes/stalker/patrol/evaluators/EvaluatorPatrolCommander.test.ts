import { describe, expect, it, jest } from "@jest/globals";

import { ISchemePatrolState, PatrolManager } from "@/engine/core/schemes/stalker/patrol";
import { EvaluatorPatrolCommander } from "@/engine/core/schemes/stalker/patrol/evaluators/EvaluatorPatrolCommander";
import { patrolConfig } from "@/engine/core/schemes/stalker/patrol/PatrolConfig";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("EvaluatorPatrolCommander", () => {
  it("should correctly check if patrol commander", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const evaluator: EvaluatorPatrolCommander = new EvaluatorPatrolCommander(state);
    const manager: PatrolManager = new PatrolManager("test-path-key");

    evaluator.setup(object, MockPropertyStorage.mock());

    state.patrolKey = "test-path-key";
    patrolConfig.PATROLS.set(state.patrolKey, manager);

    jest.spyOn(manager, "isCommander").mockImplementation(() => true);

    expect(evaluator.evaluate()).toBe(true);

    jest.spyOn(manager, "isCommander").mockImplementation(() => false);

    expect(evaluator.evaluate()).toBe(false);
  });
});
