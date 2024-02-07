import { describe, expect, it } from "@jest/globals";

import { treasureConfig } from "@/engine/core/managers/treasures";
import { getGivenTreasuresCount, getTreasuresCount } from "@/engine/core/managers/treasures/utils/treasures_stat";

describe("getGivenTreasuresCount util", () => {
  it("should correctly get given treasures count", () => {
    expect(getGivenTreasuresCount()).toBe(0);

    treasureConfig.TREASURES.get("jup_b1_secret").given = true;
    expect(getGivenTreasuresCount()).toBe(1);

    treasureConfig.TREASURES.get("jup_b2_secret").given = true;
    expect(getGivenTreasuresCount()).toBe(2);
  });
});

describe("getTreasuresCount util", () => {
  it("should correctly get treasures count", () => {
    expect(getTreasuresCount()).toBe(3);
    expect(treasureConfig.TREASURES.length()).toBe(3);
  });
});
