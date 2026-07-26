import { describe, expect, it, jest } from "@jest/globals";

import { AbuseController, ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { EvaluatorAbuse } from "@/engine/core/schemes/stalker/abuse/evaluators/EvaluatorAbuse";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

describe("EvaluatorAbuse", () => {
  it("should correctly check if abuse is necessary", () => {
    const state: ISchemeAbuseState = mockSchemeState(EScheme.ABUSE);
    const evaluator: EvaluatorAbuse = new EvaluatorAbuse(state);

    state.abuseController = { update: jest.fn(() => true) } as unknown as AbuseController;

    jest.spyOn(state.abuseController, "update").mockImplementation(() => false);
    expect(evaluator.evaluate()).toBe(false);
    expect(state.abuseController.update).toHaveBeenCalledTimes(1);

    jest.spyOn(state.abuseController, "update").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(true);
    expect(state.abuseController.update).toHaveBeenCalledTimes(2);
  });
});
