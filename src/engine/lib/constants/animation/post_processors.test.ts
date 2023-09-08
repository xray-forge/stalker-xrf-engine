import { describe, expect, it } from "@jest/globals";

import { postProcessors } from "@/engine/lib/constants/animation";

describe("'post_processors' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(postProcessors).forEach(([key, value]) => expect(key + ".ppe").toBe(value));
  });
});
