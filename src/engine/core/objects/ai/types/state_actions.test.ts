import { describe, expect, it } from "@jest/globals";

import { EStateActionId } from "@/engine/core/objects/ai";

describe("'state_actions' constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EStateActionId).forEach((value) => {
      expect(existing.has(value)).toBeFalsy();
      existing.add(value);
    });
  });
});
