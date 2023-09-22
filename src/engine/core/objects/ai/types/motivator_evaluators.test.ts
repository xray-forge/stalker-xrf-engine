import { describe, it } from "@jest/globals";

import { EEvaluatorId } from "@/engine/core/objects/ai/types";

describe("motivator_evaluators constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EEvaluatorId).forEach((value) => {
      if (existing.has(value)) {
        throw new Error(`Found duplicate in declaration: ${value} / ${EEvaluatorId[value as number]}.`);
      }

      existing.add(value);
    });
  });
});
