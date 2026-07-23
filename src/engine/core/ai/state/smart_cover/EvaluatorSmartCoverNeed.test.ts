import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { EvaluatorSmartCoverNeed } from "@/engine/core/ai/state/smart_cover/EvaluatorSmartCoverNeed";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { registerObject } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("EvaluatorSmartCoverNeed", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("requires a configured cover only for the smart-cover target state", () => {
    const object: GameObject = MockGameObject.mock();
    const state = registerObject(object);
    const controller = new StalkerStateController(object);
    const evaluator = new EvaluatorSmartCoverNeed(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);

    controller.targetState = EStalkerState.SMART_COVER;
    setSchemeState(
      state,
      EScheme.SMARTCOVER,
      mockSchemeState<ISchemeSmartCoverState>(EScheme.SMARTCOVER, { coverName: "cover" })
    );
    expect(evaluator.evaluate()).toBe(true);
  });
});
