import { describe, expect, it } from "@jest/globals";

import { readIniTravelDialogs } from "@/engine/core/managers/travel/utils/travel_init";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { mockIniFile } from "@/fixtures/xray";

describe("travel_init utils", () => {
  it("readIniTravelDialogs should correctly read locations", () => {
    expect(readIniTravelDialogs(mockIniFile("test.ltx", {}))).toEqualLuaArrays([{}, {}]);

    expect(
      readIniTravelDialogs(
        mockIniFile("test.ltx", {
          traveler: ["zat_b55", "zat_b100"],
          zat_b55: {
            level: "zaton",
            name: "st_zat_b55_name",
            condlist: true,
          },
          zat_b100: {
            level: "zaton",
            name: "st_zat_b100_name",
            condlist: true,
          },
        })
      )
    ).toEqualLuaArrays([
      {
        zat_b100: {
          condlist: parseConditionsList(TRUE),
          level: "zaton",
          name: "st_zat_b100_name",
          phraseId: "1001",
        },
        zat_b55: {
          condlist: parseConditionsList(TRUE),
          level: "zaton",
          name: "st_zat_b55_name",
          phraseId: "1000",
        },
      },
      {
        "1000": "zat_b55",
        "1001": "zat_b100",
      },
    ]);
  });
});
