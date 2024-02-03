import { describe, expect, it, jest } from "@jest/globals";

import { AbuseManager, ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { EvaluatorAbuse } from "@/engine/core/schemes/stalker/abuse/evaluators/EvaluatorAbuse";
import { EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";

describe("EvaluatorAbuse", () => {
  it("should correctly check if abuse is necessary", () => {
    const state: ISchemeAbuseState = mockSchemeState(EScheme.ABUSE);
    const evaluator: EvaluatorAbuse = new EvaluatorAbuse(state);

    state.abuseManager = { update: jest.fn(() => true) } as unknown as AbuseManager;

    jest.spyOn(state.abuseManager, "update").mockImplementation(() => false);
    expect(evaluator.evaluate()).toBe(false);
    expect(state.abuseManager.update).toHaveBeenCalledTimes(1);

    jest.spyOn(state.abuseManager, "update").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(true);
    expect(state.abuseManager.update).toHaveBeenCalledTimes(2);
  });
});
