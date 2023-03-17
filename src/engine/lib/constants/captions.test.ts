import { describe, expect, it } from "@jest/globals";

import { captions } from "@/engine/lib/constants/captions";

describe("'captions' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(captions).forEach(([key, value]) => expect(key).toBe(value));
  });
});
