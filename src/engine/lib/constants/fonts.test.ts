import { describe, expect, it } from "@jest/globals";

import { fonts } from "@/engine/lib/constants/fonts";

describe("fonts constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(fonts).forEach(([key, value]) => expect(key).toBe(value));
  });
});
