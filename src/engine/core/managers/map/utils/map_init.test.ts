import { describe, expect, it } from "@jest/globals";

import {
  readIniMapMarks,
  readIniMapScannerSpots,
  readIniMapSpots,
  readIniSleepSpots,
} from "@/engine/core/managers/map/utils/map_init";
import { mockIniFile } from "@/fixtures/xray";

describe("map_init utils", () => {
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

  it("readIniSleepSpots should correctly read locations", () => {
    expect(() => readIniSleepSpots(mockIniFile("test.ltx", {}))).toThrow(
      "Expect 'sleep_spots' section to exist in ini file."
    );
    expect(readIniSleepSpots(mockIniFile("test.ltx", { sleep_spots: {} }))).toEqualLuaArrays([]);

    expect(
      readIniSleepSpots(
        mockIniFile("test.ltx", {
          sleep_spots: {
            a: "a_name",
            b: "b_name",
          },
        })
      )
    ).toEqualLuaArrays([
      { target: "a", hint: "a_name" },
      { target: "b", hint: "b_name" },
    ]);
  });

  it("readIniMapMarks should correctly read marks", () => {
    expect(() => readIniMapMarks(mockIniFile("test.ltx", {}))).toThrow(
      "Expect 'map_marks' section to exist in ini file."
    );

    expect(() => {
      readIniMapMarks(
        mockIniFile("test.ltx", {
          map_marks: ["a", "b"],
        })
      );
    }).toThrow("Attempt to read a non-existent string field 'icon' in section 'a'.");

    expect(readIniMapMarks(mockIniFile("test.ltx", { map_marks: {} }))).toEqualLuaArrays([]);

    expect(
      readIniMapMarks(
        mockIniFile("test.ltx", {
          map_marks: ["a", "b"],
          a: {
            icon: "a_icon",
            hint: "a_hint",
          },
          b: {
            icon: "b_icon",
            hint: "b_hint",
          },
        })
      )
    ).toEqualLuaTables({
      a: {
        icon: "a_icon",
        hint: "a_hint",
      },
      b: {
        icon: "b_icon",
        hint: "b_hint",
      },
    });
  });

  it("readIniMapScannerSpots should correctly read spots", () => {
    expect(() => readIniMapScannerSpots(mockIniFile("test.ltx", {}))).toThrow(
      "Expect 'scanner_spots' section to exist in ini file."
    );

    expect(() => {
      readIniMapScannerSpots(
        mockIniFile("test.ltx", {
          scanner_spots: ["a", "b"],
        })
      );
    }).toThrow("Attempt to read a non-existent string field 'target' in section 'a'.");

    expect(readIniMapScannerSpots(mockIniFile("test.ltx", { scanner_spots: {} }))).toEqualLuaArrays([]);

    expect(
      readIniMapScannerSpots(
        mockIniFile("test.ltx", {
          scanner_spots: ["a", "b"],
          a: {
            target: "a_target",
            zone: "a_zone",
            hint: "a_hint",
            group: "a_group",
          },
          b: {
            target: "b_target",
            zone: "b_zone",
            hint: "b_hint",
            group: "b_group",
          },
        })
      )
    ).toEqualLuaArrays([
      {
        isEnabled: false,
        target: "a_target",
        zone: "a_zone",
        hint: "a_hint",
        group: "a_group",
      },
      {
        isEnabled: false,
        target: "b_target",
        zone: "b_zone",
        hint: "b_hint",
        group: "b_group",
      },
    ]);
  });
});
