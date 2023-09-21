import { describe, expect, it } from "@jest/globals";

import { storyNames } from "@/engine/lib/constants/story_names";

describe("story_names constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(storyNames).forEach(([key, value]) => expect(key).toBe(value));
  });
});
