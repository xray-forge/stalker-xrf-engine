import { describe, expect, it } from "@jest/globals";

import { levels } from "@/engine/lib/constants/levels";

describe("levels constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(levels).forEach(([key, value]) => expect(key).toBe(value));
  });
});
