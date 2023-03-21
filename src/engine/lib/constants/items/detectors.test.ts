import { describe, expect, it } from "@jest/globals";

import { detectors } from "@/engine/lib/constants/items/detectors";

describe("'detectors' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(detectors).forEach(([key, value]) => expect(key).toBe(value));
  });
});
