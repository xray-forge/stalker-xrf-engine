import { describe, expect, it } from "@jest/globals";

import { STRINGIFIED_NIL } from "@/engine/lib/constants/lua";
import {
  parseConditionsList,
  parseNames,
  parseNumbers,
  parseParameters,
  parseSpawnDetails,
} from "@/engine/scripts/utils/parse";
import { luaTableToArray } from "@/fixtures/lua/utils";

describe("'ini_data' parsing utils", () => {
  it("Should correctly parse names array", () => {
    expect(luaTableToArray(parseNames("a, b, c"))).toEqual(["a", "b", "c"]);
    expect(luaTableToArray(parseNames("name_1, example_b, name_complex_here"))).toEqual([
      "name_1",
      "example_b",
      "name_complex_here",
    ]);
  });

  it("Should correctly parse numbers array", () => {
    expect(luaTableToArray(parseNumbers("1, 2, 3, 4"))).toEqual([1, 2, 3, 4]);
    expect(luaTableToArray(parseNumbers("1.5, 2.33, 3.0"))).toEqual([1.5, 2.33, 3.0]);
    expect(luaTableToArray(parseNumbers("15, 0, -43, 9999"))).toEqual([15, 0, -43, 9999]);
  });

  it("Should correctly parse spawn details", () => {
    expect(luaTableToArray(parseSpawnDetails(""))).toEqual([]);
    expect(luaTableToArray(parseSpawnDetails("1,1"))).toEqual([
      {
        count: 1,
        probability: 1,
      },
    ]);
    expect(luaTableToArray(parseSpawnDetails("2, 0.2"))).toEqual([
      {
        count: 2,
        probability: 0.2,
      },
    ]);
    expect(luaTableToArray(parseSpawnDetails("5,0.5,4,0.3"))).toEqual([
      {
        count: 5,
        probability: 0.5,
      },
      {
        count: 4,
        probability: 0.3,
      },
    ]);
  });

  it("Should correctly parse call parameters", () => {
    expect(luaTableToArray(parseParameters(STRINGIFIED_NIL))).toEqual([STRINGIFIED_NIL]);
    expect(luaTableToArray(parseParameters("abcd"))).toEqual(["abcd"]);
    expect(luaTableToArray(parseParameters("a|b|c|d"))).toEqual(["a", "b", "c", "d"]);
  });

  it("Should correctly parse condition lists", () => {
    expect(luaTableToArray(parseConditionsList(null, null, null, "{+zat_b104_task_end}4,0"))).toStrictEqual([
      { infop_check: { 1: { name: "zat_b104_task_end", required: true } }, infop_set: {}, section: "4" },
      { infop_check: {}, section: "0", infop_set: {} },
    ]);

    expect(luaTableToArray(parseConditionsList(null, null, null, "zat_b28_heli_3_crash_name"))).toStrictEqual([
      { infop_check: {}, section: "zat_b28_heli_3_crash_name", infop_set: {} },
    ]);

    expect(
      luaTableToArray(
        parseConditionsList(
          null,
          null,
          null,
          "{+jup_b218_pripyat_group_gathering}0,{+zat_b28_heli_3_searched}4," +
            "{+zat_b100_heli_2_searched}4,{+zat_b101_heli_5_searched}4,0"
        )
      )
    ).toStrictEqual([
      {
        infop_check: { 1: { name: "jup_b218_pripyat_group_gathering", required: true } },
        section: "0",
        infop_set: {},
      },
      { infop_check: { 1: { name: "zat_b28_heli_3_searched", required: true } }, section: "4", infop_set: {} },
      { infop_check: { 1: { name: "zat_b100_heli_2_searched", required: true } }, section: "4", infop_set: {} },
      { infop_check: { 1: { name: "zat_b101_heli_5_searched", required: true } }, section: "4", infop_set: {} },
      { infop_check: {}, section: "0", infop_set: {} },
    ]);

    expect(
      luaTableToArray(
        parseConditionsList(
          null,
          null,
          null,
          "{+zat_b57_bloodsucker_lair_clear}0,{+zat_b38_disappearance_stalkers_meet_cop_later_give}1," +
            "{+zat_b38_failed}3,0"
        )
      )
    ).toStrictEqual([
      { infop_check: { 1: { name: "zat_b57_bloodsucker_lair_clear", required: true } }, section: "0", infop_set: {} },
      {
        infop_check: { 1: { name: "zat_b38_disappearance_stalkers_meet_cop_later_give", required: true } },
        section: "1",
        infop_set: {},
      },
      { infop_check: { 1: { name: "zat_b38_failed", required: true } }, section: "3", infop_set: {} },
      { infop_check: {}, section: "0", infop_set: {} },
    ]);

    expect(
      luaTableToArray(parseConditionsList(null, null, null, "sr_idle@end%=create_squad(zat_b56_polter_squad:zat_b56)%"))
    ).toStrictEqual([
      {
        infop_check: {},
        section: "sr_idle@end",
        infop_set: {
          1: { func: "create_squad", expected: true, params: { 1: "zat_b56_polter_squad", 2: "zat_b56" } },
        },
      },
    ]);

    expect(
      luaTableToArray(
        parseConditionsList(
          null,
          null,
          null,
          "{-zat_b42_mayron_spawn}sr_idle%=spawn_corpse(zat_b42_mayron:zat_b42_mayron_walk)+zat_b42_mayron_spawn%"
        )
      )
    ).toStrictEqual([
      {
        infop_check: { "1": { name: "zat_b42_mayron_spawn", required: false } },
        section: "sr_idle",
        infop_set: {
          "1": { func: "spawn_corpse", expected: true, params: { "1": "zat_b42_mayron", "2": "zat_b42_mayron_walk" } },
          "2": { name: "zat_b42_mayron_spawn", required: true },
        },
      },
    ]);
  });
});
