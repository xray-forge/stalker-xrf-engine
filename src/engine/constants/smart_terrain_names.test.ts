import { describe, expect, it } from "@jest/globals";

import { smartTerrainNames } from "@/engine/constants/smart_terrain_names";

describe("smart terrain name constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(smartTerrainNames).forEach(([key, value]) => expect(key).toBe(value));
  });
});
