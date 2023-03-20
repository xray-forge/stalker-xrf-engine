import { describe, expect, it } from "@jest/globals";

import { decamelize } from "@/engine/core/utils/transform/decamelize";
import { roots } from "@/engine/lib/constants/roots";

describe("'roots' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(roots).forEach(([key, value]) => expect(`$${decamelize(key)}$`).toBe(value));
  });
});
