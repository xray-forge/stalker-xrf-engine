import { describe, it } from "@jest/globals";

import { EStateActionId } from "@/engine/core/ai/state/types/state_actions";

describe("state_actions constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EStateActionId).forEach((value) => {
      if (existing.has(value)) {
        throw new Error(`Found duplicate in declaration: ${value} / ${EStateActionId[value as number]}.`);
      }

      existing.add(value);
    });
  });
});
