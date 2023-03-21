import { describe, expect, it } from "@jest/globals";

import { optionGroups, optionGroupsMessages } from "@/engine/lib/constants/option_groups";

describe("'option_groups' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(optionGroups).forEach(([key, value]) => expect(key).toBe(value));
    Object.entries(optionGroupsMessages).forEach(([key, value]) => expect(key).toBe(value));
  });
});
