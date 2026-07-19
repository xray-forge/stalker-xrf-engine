import { describe, expect, it } from "@jest/globals";

import { communities } from "@/engine/constants/communities";

describe("communities constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(communities).forEach(([key, value]) => expect(key).toBe(value));
  });
});
