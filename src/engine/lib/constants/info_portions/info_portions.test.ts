import { describe, expect, it } from "@jest/globals";

import { info_portions } from "@/engine/lib/constants/info_portions/info_portions";

describe("'info_portions' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(info_portions).forEach(([key, value]) => expect(key).toBe(value));
  });
});
