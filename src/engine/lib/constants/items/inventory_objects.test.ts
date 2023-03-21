import { describe, expect, it } from "@jest/globals";

import { inventory_objects } from "@/engine/lib/constants/items/inventory_objects";

describe("'inventory_objects' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(inventory_objects).forEach(([key, value]) => expect(key).toBe(value));
  });
});
