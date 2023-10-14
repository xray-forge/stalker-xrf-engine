import { describe, expect, it } from "@jest/globals";

import { treasureConfig } from "@/engine/core/managers/treasures";
import { register } from "@/engine/extensions/enhanced_treasures/main";

describe("enhanced treasures", () => {
  it("should correctly change config of treasures", () => {
    expect(treasureConfig.ENHANCED_MODE_ENABLED).toBe(false);

    register();

    expect(treasureConfig.ENHANCED_MODE_ENABLED).toBe(true);
  });
});
