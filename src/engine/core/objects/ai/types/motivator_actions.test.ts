import { describe, expect, it } from "@jest/globals";

import { EActionId } from "@/engine/core/objects/ai/types";

describe("'motivator_actions' constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EActionId).forEach((value) => {
      expect(existing.has(value)).toBeFalsy();
      existing.add(value);
    });
  });
});
