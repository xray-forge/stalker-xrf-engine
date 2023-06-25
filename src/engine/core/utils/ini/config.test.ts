import { describe, expect, it } from "@jest/globals";

import { registerStoryLink } from "@/engine/core/database";
import { IBaseSchemeLogic } from "@/engine/core/schemes";
import { addConditionToList, getConfigSwitchConditions, parseConditionsList } from "@/engine/core/utils/ini";
import { LuaArray, ServerObject, TIndex } from "@/engine/lib/types";
import { mockBaseSchemeLogic } from "@/fixtures/engine";
import { luaTableToArray, luaTableToObject } from "@/fixtures/lua";
import { mockIniFile, mockServerAlifeObject } from "@/fixtures/xray";

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

    expect(luaTableToArray(list)).toEqual([
      luaTableToObject(
        mockBaseSchemeLogic({
          name: "first",
          npc_id: 123,
          v1: 1,
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          name: "second",
          npc_id: 333,
          v1: "a",
          v2: "b",
        })
      ),
    ]);
  });

  it("getConfigSwitchConditions correctly parse empty/other ini files conditions", () => {
    expect(
      getConfigSwitchConditions(
        mockIniFile("test.ltx", {
          existing: {
            on_signal: "true",
          },
        }),
        "not_existing"
      )
    ).toBeNull();

    expect(
      luaTableToObject(
        getConfigSwitchConditions(
          mockIniFile("test.ltx", {
            existing: {},
          }),
          "existing"
        )
      )
    ).toEqual({});

    expect(
      luaTableToObject(
        getConfigSwitchConditions(
          mockIniFile("test.ltx", {
            existing: {
              first: 1,
              second: "b",
            },
          }),
          "existing"
        )
      )
    ).toEqual({});
  });

  it("getConfigSwitchConditions correctly parse different listed conditions", () => {
    expect(
      luaTableToArray(
        getConfigSwitchConditions(
          mockIniFile("test.ltx", {
            existing: {
              another: 1,
              something: "else",
              on_actor_dist_le: "3 | {=actor_has_weapon} remark",
            },
          }),
          "existing"
        )
      )
    ).toEqual([
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: 3,
          name: "on_actor_dist_le",
          condlist: parseConditionsList("{=actor_has_weapon} remark"),
        })
      ),
    ]);

    expect(
      luaTableToArray(
        getConfigSwitchConditions(
          mockIniFile("test.ltx", {
            existing: {
              on_actor_dist_le_nvis: "31 | {=actor_condition} value",
              on_actor_dist_ge: "55 | {=another_cond} another",
            },
          }),
          "existing"
        )
      )
    ).toEqual([
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: 31,
          name: "on_actor_dist_le_nvis",
          condlist: parseConditionsList("{=actor_condition} value"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: 55,
          name: "on_actor_dist_ge",
          condlist: parseConditionsList("{=another_cond} another"),
        })
      ),
    ]);

    const serverObject: ServerObject = mockServerAlifeObject();

    registerStoryLink(serverObject.id, "test-cfg-sid");

    expect(
      luaTableToArray(
        getConfigSwitchConditions(
          mockIniFile("test.ltx", {
            existing: {
              on_actor_dist_ge_nvis: "100|test1",
              on_signal: "anim_end|test2",
              on_info: "{+pri_a28_infop} test3",
              on_timer: "50|test4",
              on_game_timer: "10|test5",
              on_actor_in_zone: "zat_b38|test7",
              on_actor_not_in_zone: "zat_b38|test8",
              on_actor_inside: "test9",
              on_actor_outside: "test10",
              on_npc_in_zone: "test-cfg-sid|jup_hide_a6|test11",
              on_npc_not_in_zone: "test-cfg-sid|jup_hide_a6|test12",
            },
          }),
          "existing"
        )
      )
    ).toEqual([
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: 100,
          name: "on_actor_dist_ge_nvis",
          condlist: parseConditionsList("test1"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: "anim_end",
          name: "on_signal",
          condlist: parseConditionsList("test2"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          name: "on_info",
          condlist: parseConditionsList("{+pri_a28_infop} test3"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: 50,
          name: "on_timer",
          condlist: parseConditionsList("test4"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: 10,
          name: "on_game_timer",
          condlist: parseConditionsList("test5"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: "zat_b38",
          name: "on_actor_in_zone",
          condlist: parseConditionsList("test7"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: "zat_b38",
          name: "on_actor_not_in_zone",
          condlist: parseConditionsList("test8"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          name: "on_actor_inside",
          condlist: parseConditionsList("test9"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          name: "on_actor_outside",
          condlist: parseConditionsList("test10"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: "test-cfg-sid",
          v2: "jup_hide_a6",
          npc_id: serverObject.id,
          name: "on_npc_in_zone",
          condlist: parseConditionsList("test11"),
        })
      ),
      luaTableToObject(
        mockBaseSchemeLogic({
          v1: "test-cfg-sid",
          v2: "jup_hide_a6",
          npc_id: serverObject.id,
          name: "on_npc_not_in_zone",
          condlist: parseConditionsList("test12"),
        })
      ),
    ]);
  });
});
