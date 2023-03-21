import { describe, expect, it } from "@jest/globals";

import { zones } from "@/engine/lib/constants/zones/zones";

describe("'zones' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(zones).forEach(([key, value]) => expect(key).toBe(value));
  });
});
