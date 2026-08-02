import { describe, expect, it } from "@jest/globals";

import { storyIds } from "@/engine/constants/story_ids";

describe("story ID constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(storyIds).forEach(([key, value]) => expect(key).toBe(value));
  });
});
