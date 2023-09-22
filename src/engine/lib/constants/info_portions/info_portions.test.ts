import { describe, expect, it } from "@jest/globals";

import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";

describe("info_portions constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(infoPortions).forEach(([key, value]) => expect(key).toBe(value));
  });
});
