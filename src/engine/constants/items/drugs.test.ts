import { describe, expect, it } from "@jest/globals";

import { drugs, medkits } from "@/engine/constants/items/drugs";

describe("drugs constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(medkits).forEach(([key, value]) => expect(key).toBe(value));
    Object.entries(drugs).forEach(([key, value]) => expect(key).toBe(value));
  });
});
