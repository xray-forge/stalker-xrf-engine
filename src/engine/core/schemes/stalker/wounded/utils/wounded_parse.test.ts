import { describe, expect, it } from "@jest/globals";

import { getStateIndexByHp, parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils/wounded_parse";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { MockLuaTable } from "@/fixtures/lua";

describe("parseWoundedData util", () => {
  it("should correctly parse data", () => {
    expect(parseWoundedData("0|false")).toEqualLuaTables([
      {
        hp: 0,
        sound: null,
        state: parseConditionsList("false"),
      },
    ]);

    expect(parseWoundedData("40|wounded_zombie@nil")).toEqualLuaTables([
      {
        hp: 40,
        sound: parseConditionsList("nil"),
        state: parseConditionsList("wounded_zombie"),
      },
    ]);

    expect(parseWoundedData("40|wounded_heavy_2@help_heavy")).toEqualLuaTables([
      {
        hp: 40,
        sound: parseConditionsList("help_heavy"),
        state: parseConditionsList("wounded_heavy_2"),
      },
    ]);
  });
});

describe("getStateIndexByHp util", () => {
  it("should correctly find matching indexes", () => {
    expect(getStateIndexByHp(MockLuaTable.mock(), -1)).toBeNull();
    expect(getStateIndexByHp(MockLuaTable.mock(), 0)).toBeNull();
    expect(getStateIndexByHp(MockLuaTable.mock(), 1)).toBeNull();

    expect(getStateIndexByHp(parseWoundedData("0|false"), -1)).toBe(1);
    expect(getStateIndexByHp(parseWoundedData("0|false"), 0)).toBe(1);
    expect(getStateIndexByHp(parseWoundedData("0|false"), 1)).toBeNull();

    expect(getStateIndexByHp(parseWoundedData("10|false|20|false|30|false|40|false"), 0)).toBe(4);
    expect(getStateIndexByHp(parseWoundedData("10|false|20|false|30|false|40|false"), 10)).toBe(4);
    expect(getStateIndexByHp(parseWoundedData("10|false|20|false|30|false|40|false"), 20)).toBeNull();
    expect(getStateIndexByHp(parseWoundedData("10|false|20|false|30|false|40|false"), 30)).toBeNull();
    expect(getStateIndexByHp(parseWoundedData("10|false|20|false|30|false|40|false"), 40)).toBeNull();
    expect(getStateIndexByHp(parseWoundedData("10|false|20|false|30|false|40|false"), 50)).toBeNull();

    expect(getStateIndexByHp(parseWoundedData("40|false|30|false|20|false|10|false"), 0)).toBe(4);
    expect(getStateIndexByHp(parseWoundedData("40|false|30|false|20|false|10|false"), 10)).toBe(4);
    expect(getStateIndexByHp(parseWoundedData("40|false|30|false|20|false|10|false"), 20)).toBe(3);
    expect(getStateIndexByHp(parseWoundedData("40|false|30|false|20|false|10|false"), 30)).toBe(2);
    expect(getStateIndexByHp(parseWoundedData("40|false|30|false|20|false|10|false"), 40)).toBe(1);
    expect(getStateIndexByHp(parseWoundedData("40|false|30|false|20|false|10|false"), 50)).toBeNull();
  });
});
