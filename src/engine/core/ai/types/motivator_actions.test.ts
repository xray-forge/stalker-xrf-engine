import { describe, it } from "@jest/globals";

import { EActionId } from "@/engine/core/ai/types/index";

describe("motivator_actions constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EActionId).forEach((value) => {
      if (existing.has(value)) {
        throw new Error(`Found duplicate in declaration: ${value} / ${EActionId[value as number]}.`);
      }

      existing.add(value);
    });
  });
});
