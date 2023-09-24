import { describe, expect, it } from "@jest/globals";

import { parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils/wounded_parse";
import { parseConditionsList } from "@/engine/core/utils/ini";

describe("wounded_parse utils", () => {
  it("parseWoundedData should correctly parse data", () => {
    expect(parseWoundedData("0|false")).toEqualLuaTables([
      {
        dist: 0,
        sound: null,
        state: parseConditionsList("false"),
      },
    ]);

    expect(parseWoundedData("40|wounded_zombie@nil")).toEqualLuaTables([
      {
        dist: 40,
        sound: parseConditionsList("nil"),
        state: parseConditionsList("wounded_zombie"),
      },
    ]);

    expect(parseWoundedData("40|wounded_heavy_2@help_heavy")).toEqualLuaTables([
      {
        dist: 40,
        sound: parseConditionsList("help_heavy"),
        state: parseConditionsList("wounded_heavy_2"),
      },
    ]);
  });
});
