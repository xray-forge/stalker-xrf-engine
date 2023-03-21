import { describe, expect, it } from "@jest/globals";

import { postProcessors } from "@/engine/lib/constants/animation/post_processors";

describe("'post_processors' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(postProcessors).forEach(([key, value]) => expect(key + ".ppe").toBe(value));
  });
});
