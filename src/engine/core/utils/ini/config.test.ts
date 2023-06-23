import { describe, expect, it } from "@jest/globals";

import { IBaseSchemeLogic } from "@/engine/core/schemes";
import { addConditionToList } from "@/engine/core/utils/ini/config";
import { LuaArray, TIndex } from "@/engine/lib/types";
import { luaTableToObject } from "@/fixtures/lua/mocks/lua_utils";

describe("'config' utils for ini file", () => {
  it("'addCondition' util should fill table and return new index", () => {
    const list: LuaArray<IBaseSchemeLogic> = new LuaTable();

    expect(addConditionToList(list, 1, null)).toBe(1);
    expect(addConditionToList(list, 2, null)).toBe(2);

    expect(list.length()).toBe(0);

    const firstIndex: TIndex = addConditionToList(list, 1, {
      condlist: new LuaTable(),
      npc_id: 123,
      v1: 1,
      v2: null,
      name: "first",
    });
    const secondIndex: TIndex = addConditionToList(list, 2, {
      condlist: new LuaTable(),
      npc_id: 333,
      v1: "a",
      v2: "b",
      name: "second",
    });

    expect(list.length()).toBe(2);
    expect(firstIndex).toBe(2);
    expect(secondIndex).toBe(3);

    expect(luaTableToObject(list)).toEqual({
      "1": {
        condlist: {},
        name: "first",
        npc_id: 123,
        v1: 1,
        v2: null,
      },
      "2": {
        condlist: {},
        name: "second",
        npc_id: 333,
        v1: "a",
        v2: "b",
      },
    });
  });
});
