import { describe, expect, it } from "@jest/globals";

import { inventoryObjects } from "@/engine/lib/constants/items/inventory_objects";

describe("'inventory_objects' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(inventoryObjects).forEach(([key, value]) => expect(key).toBe(value));
  });
});
