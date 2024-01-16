import { describe, expect, it } from "@jest/globals";

import { ISchemePatrolState, PatrolManager } from "@/engine/core/schemes/stalker/patrol";
import { EvaluatorPatrolCommander } from "@/engine/core/schemes/stalker/patrol/evaluators/EvaluatorPatrolCommander";
import { patrolConfig } from "@/engine/core/schemes/stalker/patrol/PatrolConfig";
import { MAX_U16 } from "@/engine/lib/constants/memory";
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

    manager.commanderId = object.id();

    expect(evaluator.evaluate()).toBe(true);

    manager.commanderId = MAX_U16;

    expect(evaluator.evaluate()).toBe(false);
  });
});
