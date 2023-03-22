import { describe, expect, it } from "@jest/globals";

import { EActionId } from "@/engine/core/schemes/base/id/action_ids";

describe("'action_ids' constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<number> = new Set();

    Object.entries(EActionId).forEach(([key, value]) => {
      expect(existing.has(value)).toBeFalsy();
      existing.add(value);
    });
  });
});
