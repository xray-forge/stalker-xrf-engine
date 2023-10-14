import { describe, expect, it } from "@jest/globals";

import { readIniMapSpots } from "@/engine/core/managers/map/utils/map_init";
import { mockIniFile } from "@/fixtures/xray";

describe("travel_init utils", () => {
  it("readIniTravelDialogs should correctly read locations", () => {
    expect(() => readIniMapSpots(mockIniFile("test.ltx", {}))).toThrow(
      "Expect 'map_spots' section to exist in ini file."
    );
    expect(readIniMapSpots(mockIniFile("test.ltx", { map_spots: {} }))).toEqualLuaArrays([]);

    expect(
      readIniMapSpots(
        mockIniFile("test.ltx", {
          map_spots: {
            a: "a_name",
            b: "b_name",
          },
        })
      )
    ).toEqualLuaArrays([
      { target: "a", hint: "a_name", isVisible: false },
      { target: "b", hint: "b_name", isVisible: false },
    ]);
  });
});
