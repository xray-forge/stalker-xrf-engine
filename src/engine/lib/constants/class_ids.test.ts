import { describe, expect, it } from "@jest/globals";

import { gameClassId } from "@/engine/lib/constants/class_ids";

describe("'class_ids' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(gameClassId).forEach(([key, value]) => expect(key).toBe(value));
  });
});
