import { describe, expect, it } from "@jest/globals";

import { helmets } from "@/engine/lib/constants/items/helmets";

describe("'helmets' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(helmets).forEach(([key, value]) => expect(key).toBe(value));
  });
});
