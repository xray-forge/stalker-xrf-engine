import { describe, expect, it } from "@jest/globals";

import {
  getSchemeFromSection,
  parseConditionsList,
  parseInfoPortions,
  parseNumbersList,
  parseParameters,
  parseSpawnDetails,
  parseStringOptional,
  parseStringsList,
} from "@/engine/core/utils/ini/parse";
import { IConfigCondition } from "@/engine/core/utils/ini/types";
import { NIL } from "@/engine/lib/constants/words";
import { LuaArray } from "@/engine/lib/types";
import { luaTableToArray, luaTableToObject } from "@/fixtures/lua/mocks/utils";

describe("'ini_data' parsing utils", () => {
  it("Should correctly parse names array", () => {
    expect(luaTableToArray(parseStringsList("a, b, c"))).toEqual(["a", "b", "c"]);
    expect(luaTableToArray(parseStringsList("a b c"))).toEqual(["a", "b", "c"]);
    expect(luaTableToArray(parseStringsList("name_1, example_b, name_complex_here"))).toEqual([
      "name_1",
      "example_b",
      "name_complex_here",
    ]);
    expect(luaTableToArray(parseStringsList("-1, 2, -3"))).toEqual(["-1", "2", "-3"]);
    expect(luaTableToArray(parseStringsList("-1 2 -3"))).toEqual(["-1", "2", "-3"]);
    expect(luaTableToArray(parseStringsList("-1.5 2.255"))).toEqual(["-1.5", "2.255"]);
    expect(luaTableToArray(parseStringsList("a_b, c_d"))).toEqual(["a_b", "c_d"]);
  });

  it("Should correctly parse numbers array", () => {
    expect(luaTableToArray(parseNumbersList("1, 2, 3, 4"))).toEqual([1, 2, 3, 4]);
    expect(luaTableToArray(parseNumbersList("1.5, 2.33, 3.0"))).toEqual([1.5, 2.33, 3.0]);
    expect(luaTableToArray(parseNumbersList("1.5 2.33 3.0"))).toEqual([1.5, 2.33, 3.0]);
    expect(luaTableToArray(parseNumbersList("1.5 2.33, 3.0"))).toEqual([1.5, 2.33, 3.0]);
    expect(luaTableToArray(parseNumbersList("15, 0, -43, 9999"))).toEqual([15, 0, -43, 9999]);
    expect(luaTableToArray(parseNumbersList("15 0 -43 9999"))).toEqual([15, 0, -43, 9999]);
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
    expect(luaTableToArray(parseParameters(NIL))).toEqual([NIL]);
    expect(luaTableToArray(parseParameters("abcd"))).toEqual(["abcd"]);
    expect(luaTableToArray(parseParameters("a|b|c|d"))).toEqual(["a", "b", "c", "d"]);
    expect(luaTableToArray(parseParameters("a|{+ex_info =some_cb(true:d:1) !is_rainy} abc"))).toEqual([
      "a",
      "{+ex_info =some_cb(true:d:1) !is_rainy} abc",
    ]);
  });

  it("Should correctly parse condition lists", () => {
    expect(luaTableToArray(parseConditionsList("{+zat_b104_task_end}4,0"))).toStrictEqual([
      { infop_check: { 1: { name: "zat_b104_task_end", required: true } }, infop_set: {}, section: "4" },
      { infop_check: {}, section: "0", infop_set: {} },
    ]);

    expect(luaTableToArray(parseConditionsList("zat_b28_heli_3_crash_name"))).toStrictEqual([
      { infop_check: {}, section: "zat_b28_heli_3_crash_name", infop_set: {} },
    ]);

    expect(
      luaTableToArray(
        parseConditionsList(
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
      luaTableToArray(parseConditionsList("sr_idle@end%=create_squad(zat_b56_polter_squad:zat_b56)%"))
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

  it("'parseInfoPortions' should correctly parse info", () => {
    const first: LuaArray<IConfigCondition> = parseInfoPortions(
      new LuaTable(),
      "=spawn_corpse(zat_b42_mayron:zat_b42_mayron_walk)+zat_b42_mayron_spawn"
    );

    expect(luaTableToObject(first)).toEqual({
      "1": {
        expected: true,
        func: "spawn_corpse",
        params: {
          "1": "zat_b42_mayron",
          "2": "zat_b42_mayron_walk",
        },
      },
      "2": {
        name: "zat_b42_mayron_spawn",
        required: true,
      },
    });

    const second: LuaArray<IConfigCondition> = parseInfoPortions(
      new LuaTable(),
      "+save_zat_b42_arrived_to_controler_lair =scenario_autosave(st_save_zat_b42_arrived_to_controler_lair)" +
        " ~50 !another"
    );

    expect(luaTableToObject(second)).toEqual({
      "1": {
        name: "save_zat_b42_arrived_to_controler_lair",
        required: true,
      },
      "2": {
        expected: true,
        func: "scenario_autosave",
        params: {
          "1": "st_save_zat_b42_arrived_to_controler_lair",
        },
      },
      "3": {
        prob: 50,
      },
      "4": {
        expected: false,
        func: "another",
        params: null,
      },
    });

    const third: LuaArray<IConfigCondition> = new LuaTable();

    expect(parseInfoPortions(third, null)).toBe(third);
    expect(luaTableToObject(parseInfoPortions(third, null))).toEqual({});
  });

  it("'parseStringOptional' should correctly handle values", () => {
    expect(parseStringOptional(NIL)).toBeNull();
    expect(parseStringOptional("nil")).toBeNull();
    expect(parseStringOptional("null")).toBe("null");
    expect(parseStringOptional("test")).toBe("test");
    expect(parseStringOptional("12345")).toBe("12345");
  });

  it("'getSchemeFromSection' should correctly return scheme", () => {
    expect(getSchemeFromSection("test")).toBe("test");
    expect(getSchemeFromSection("test@example")).toBe("test");
    expect(getSchemeFromSection("combat@first")).toBe("combat");
    expect(getSchemeFromSection("")).toBeNull();
    expect(getSchemeFromSection("@")).toBeNull();
    expect(getSchemeFromSection("@abc")).toBeNull();
  });
});
