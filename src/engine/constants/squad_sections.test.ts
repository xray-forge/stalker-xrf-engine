import { describe, expect, it } from "@jest/globals";

import { squadSections } from "@/engine/constants/squad_sections";

describe("squad section constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(squadSections).forEach(([key, value]) => expect(key).toBe(value));
  });
});
