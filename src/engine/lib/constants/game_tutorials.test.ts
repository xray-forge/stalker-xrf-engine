import { describe, expect, it } from "@jest/globals";

import { gameTutorials } from "@/engine/lib/constants/game_tutorials";

describe("'game_tutorials' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(gameTutorials).forEach(([key, value]) => expect(key).toBe(value));
  });
});
