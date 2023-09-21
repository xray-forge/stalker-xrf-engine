import { describe, expect, it } from "@jest/globals";

import { mapMarks } from "@/engine/lib/constants/map_marks";

describe("map_marks constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(mapMarks).forEach(([key, value]) => expect(key).toBe(value));
  });
});
