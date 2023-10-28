import { describe, it } from "@jest/globals";

import { EStateEvaluatorId } from "@/engine/core/ai/types/index";

describe("state_evaluators constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EStateEvaluatorId).forEach((value) => {
      if (existing.has(value)) {
        throw new Error(`Found duplicate in declaration: ${value} / ${EStateEvaluatorId[value as number]}.`);
      }

      existing.add(value);
    });
  });
});
