import { describe, expect, it } from "@jest/globals";
import { decamelize } from "xray16/lib";

import { roots } from "@/engine/constants/roots";

describe("roots constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(roots).forEach(([key, value]) => expect(`$${decamelize(key)}$`).toBe(value));
  });
});
