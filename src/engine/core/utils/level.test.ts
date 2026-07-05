import { describe, expect, it } from "@jest/globals";
import { $fromObject } from "xray16/macros";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { isUndergroundLevel } from "@/engine/core/utils/level";
import { TName } from "@/engine/lib/types";

describe("isUndergroundLevel util", () => {
  it("should correctly check if level is underground", () => {
    surgeConfig.UNDERGROUND_LEVELS = $fromObject<TName, boolean>({
      zaton: false,
      jupiter: false,
      labx8: true,
      jupiter_underground: true,
    });

    expect(isUndergroundLevel("zaton")).toBe(false);
    expect(isUndergroundLevel("jupiter")).toBe(false);
    expect(isUndergroundLevel("labx8")).toBe(true);
    expect(isUndergroundLevel("jupiter_underground")).toBe(true);
  });
});
