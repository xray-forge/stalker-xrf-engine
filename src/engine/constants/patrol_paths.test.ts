import { describe, expect, it } from "@jest/globals";

import { patrolPaths } from "@/engine/constants/patrol_paths";

describe("patrol path constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(patrolPaths).forEach(([key, value]) => expect(key).toBe(value));
  });
});
