import { describe, expect, it } from "@jest/globals";

import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { register } from "@/engine/extensions/enhanced_items_drop/main";

describe("enhanced drop", () => {
  it("should correctly change config of drop", () => {
    expect(upgradesConfig.ADD_RANDOM_UPGRADES).toBe(false);

    register();

    expect(upgradesConfig.ADD_RANDOM_UPGRADES).toBe(true);
  });
});
