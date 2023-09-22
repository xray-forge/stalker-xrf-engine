import { describe, expect, it } from "@jest/globals";

import { artefacts } from "@/engine/lib/constants/items/artefacts";

describe("artefacts constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(artefacts).forEach(([key, value]) => expect(key).toBe(value));
  });
});
