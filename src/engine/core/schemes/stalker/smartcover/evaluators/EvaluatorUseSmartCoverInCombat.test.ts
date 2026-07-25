import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject } from "@/engine/core/database";
import { isActiveSection } from "@/engine/core/schemes/runtime";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EvaluatorUseSmartCoverInCombat } from "@/engine/core/schemes/stalker/smartcover/evaluators/EvaluatorUseSmartCoverInCombat";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime", () => ({ isActiveSection: jest.fn(() => false) }));

function createEvaluator(useInCombat: boolean): EvaluatorUseSmartCoverInCombat {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeSmartCoverState = mockSchemeState<ISchemeSmartCoverState>(EScheme.SMARTCOVER, { useInCombat });
  const evaluator: EvaluatorUseSmartCoverInCombat = new EvaluatorUseSmartCoverInCombat(state);

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return evaluator;
}

describe("EvaluatorUseSmartCoverInCombat", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(isActiveSection);
    replaceFunctionMock(isActiveSection, () => false);
  });

  it("should not use smart cover for inactive section", () => {
    expect(createEvaluator(true).evaluate()).toBe(false);
  });

  it("should follow the configured flag for the active section", () => {
    replaceFunctionMock(isActiveSection, () => true);

    expect(createEvaluator(true).evaluate()).toBe(true);
    expect(createEvaluator(false).evaluate()).toBe(false);
  });
});
