import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { EvaluatorSectionActive } from "@/engine/core/objects/ai/planner/evaluators/EvaluatorSectionActive";
import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorSectionActive class", () => {
  it("should correctly check if section state is active", () => {
    const object: ClientObject = mockClientGameObject();
    const schemeState: IBaseSchemeState = mockSchemeState(object, EScheme.MEET, { section: "test@active" });
    const state: IRegistryObjectState = registerObject(object);

    const evaluator: EvaluatorSectionActive = new EvaluatorSectionActive(schemeState);

    evaluator.setup(object, new property_storage());

    state.activeSection = null;
    expect(evaluator.evaluate()).toBe(false);

    state.activeSection = "test@active";
    expect(evaluator.evaluate()).toBe(true);

    state.activeSection = "test@another";
    expect(evaluator.evaluate()).toBe(false);
  });

  it("should correctly apply custom names", () => {
    const first: EvaluatorSectionActive = new EvaluatorSectionActive(
      mockSchemeState(mockClientGameObject(), EScheme.MEET)
    );
    const second: EvaluatorSectionActive = new EvaluatorSectionActive(
      mockSchemeState(mockClientGameObject(), EScheme.MEET),
      "SomeCustomName"
    );

    expect(first.__name).toBe("EvaluatorSectionActive");
    expect(second.__name).toBe("SomeCustomName");
  });
});
