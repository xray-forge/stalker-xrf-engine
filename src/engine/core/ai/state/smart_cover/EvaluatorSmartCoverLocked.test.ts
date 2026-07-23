import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { EvaluatorSmartCoverLocked } from "@/engine/core/ai/state/smart_cover/EvaluatorSmartCoverLocked";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { registerObject } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("EvaluatorSmartCoverLocked", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("detects when the configured cover and current membership disagree", () => {
    const object: GameObject = MockGameObject.mock();
    const state = registerObject(object);
    const evaluator = new EvaluatorSmartCoverLocked(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);

    setSchemeState(
      state,
      EScheme.SMARTCOVER,
      mockSchemeState<ISchemeSmartCoverState>(EScheme.SMARTCOVER, { coverName: "cover" })
    );
    jest.spyOn(object, "in_smart_cover").mockReturnValue(false);
    expect(evaluator.evaluate()).toBe(true);
  });
});
