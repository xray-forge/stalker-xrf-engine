import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorSectionEnded } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionEnded";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

describe("EvaluatorSectionEnded", () => {
  it("should correctly check if section state has ended", () => {
    const object: GameObject = MockGameObject.mock();
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.MEET, { section: "test@active" });
    const state: IRegistryObjectState = registerObject(object);

    const evaluator: EvaluatorSectionEnded = new EvaluatorSectionEnded(schemeState);

    evaluator.setup(object, new property_storage());

    state.activeSection = null;
    expect(evaluator.evaluate()).toBe(true);

    state.activeSection = "test@active";
    expect(evaluator.evaluate()).toBe(false);

    state.activeSection = "test@another";
    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly apply custom names", () => {
    const first: EvaluatorSectionEnded = new EvaluatorSectionEnded(mockSchemeState(EScheme.MEET));
    const second: EvaluatorSectionEnded = new EvaluatorSectionEnded(mockSchemeState(EScheme.MEET), "SomeCustomName");

    expect(first.__name).toBe("EvaluatorSectionEnded");
    expect(second.__name).toBe("SomeCustomName");
  });
});
