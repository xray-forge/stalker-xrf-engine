import { describe, expect, it } from "@jest/globals";

import { getSmartCoverAnimpointSitHigh } from "@/engine/core/animation/smart_covers/animpoint_sit_high";

describe("getSmartCoverAnimpointSitHigh", () => {
  it("creates its loopholes as a Lua array", () => {
    const cover = getSmartCoverAnimpointSitHigh();

    expect(cover.loopholes.length()).toBe(1);
    expect(cover.loopholes.get(1)?.id).toBe("animpoint_sit_high");
  });
});
