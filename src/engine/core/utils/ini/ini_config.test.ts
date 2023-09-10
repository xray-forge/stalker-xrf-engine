import { describe, expect, it } from "@jest/globals";

import { registerActor, registerObject, registerStoryLink } from "@/engine/core/database";
import { IBaseSchemeLogic } from "@/engine/core/objects/ai/scheme";
import {
  addConditionToList,
  getConfigObjectAndZone,
  getConfigSwitchConditions,
  getObjectConfigOverrides,
  getSectionsFromConditionLists,
  parseConditionsList,
} from "@/engine/core/utils/ini";
import { giveInfo } from "@/engine/core/utils/object/object_info_portion";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, LuaArray, ServerObject, TIndex } from "@/engine/lib/types";
import { mockBaseSchemeLogic } from "@/fixtures/engine";
import { mockActorClientGameObject, mockClientGameObject, mockIniFile, mockServerAlifeObject } from "@/fixtures/xray";

describe("'config' utils for ini file", () => {
  it("getInfosFromData should correctly parse data list of condition lists", () => {
    registerActor(mockActorClientGameObject());
    giveInfo("test");

    expect(getSectionsFromConditionLists(mockClientGameObject(), "a|b|c")).toEqualLuaArrays(["a", "b", "c"]);
    expect(getSectionsFromConditionLists(mockClientGameObject(), "a|{+not_existing}b,c|{+test}d,e")).toEqualLuaArrays([
      "a",
      "c",
      "d",
    ]);
  });

  it("getConfigObjectAndZone should correctly parse story id and zone pair", () => {
    const serverObject: ServerObject = mockServerAlifeObject();

    registerStoryLink(serverObject.id, "zat_cop_id");

    expect(
      getConfigObjectAndZone(
        mockIniFile("test.ltx", {
          test: {
            key: "zat_cop_id|zat_b38_actor_jump_down|{+a -b}walker@get_out",
          },
        }),
        "test",
        "key"
      )
    ).toEqualLuaTables({
      condlist: parseConditionsList("{+a -b} walker@get_out"),
      name: "key",
      objectId: 100000,
      v1: "zat_cop_id",
      v2: "zat_b38_actor_jump_down",
    });
  });

  it("getObjectConfigOverrides should correctly parse overrides", () => {
    const object: ClientObject = mockClientGameObject();

    registerObject(object);

    expect(getObjectConfigOverrides(mockIniFile("test.ltx", { empty: {} }), "empty", object)).toEqualLuaTables({
      combat_ignore: null,
      combat_ignore_keep_when_attacked: false,
      combat_type: null,
      max_post_combat_time: 10,
      min_post_combat_time: 5,
      on_combat: null,
      on_offline_condlist: parseConditionsList(NIL),
      soundgroup: null,
    });

    expect(
      getObjectConfigOverrides(
        mockIniFile("test.ltx", {
          empty: {
            heli_hunter: "first",
            combat_ignore_cond: "second",
            combat_ignore_keep_when_attacked: "third",
            combat_type: "fourth",
            on_combat: "fifth",
            post_combat_time: "10, 50",
            on_offline: "sixth",
            soundgroup: "seventh",
          },
        }),
        "empty",
        object
      )
    ).toEqualLuaTables({
      combat_ignore: {
        condlist: parseConditionsList("second"),
        name: "combat_ignore_cond",
        objectId: null,
        v1: null,
        v2: null,
      },
      combat_ignore_keep_when_attacked: "third",
      combat_type: {
        condlist: parseConditionsList("fourth"),
        name: "combat_type",
        objectId: null,
        v1: null,
        v2: null,
      },
      heli_hunter: parseConditionsList("first"),
      max_post_combat_time: 50,
      min_post_combat_time: 10,
      on_combat: {
        condlist: parseConditionsList("fifth"),
        name: "on_combat",
        objectId: null,
        v1: null,
        v2: null,
      },
      on_offline_condlist: parseConditionsList("sixth"),
      soundgroup: "seventh",
    });
  });

  it("addCondition util should fill table and return new index", () => {
    const list: LuaArray<IBaseSchemeLogic> = new LuaTable();

    expect(addConditionToList(list, 1, null)).toBe(1);
    expect(addConditionToList(list, 2, null)).toBe(2);

    expect(list.length()).toBe(0);

    const firstIndex: TIndex = addConditionToList(list, 1, {
      condlist: new LuaTable(),
      objectId: 123,
      v1: 1,
      v2: null,
      name: "first",
    });
    const secondIndex: TIndex = addConditionToList(list, 2, {
      condlist: new LuaTable(),
      objectId: 333,
      v1: "a",
      v2: "b",
      name: "second",
    });

    expect(list.length()).toBe(2);
    expect(firstIndex).toBe(2);
    expect(secondIndex).toBe(3);

    expect(list).toEqualLuaArrays([
      mockBaseSchemeLogic({
        name: "first",
        objectId: 123,
        v1: 1,
      }),
      mockBaseSchemeLogic({
        name: "second",
        objectId: 333,
        v1: "a",
        v2: "b",
      }),
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
      getConfigSwitchConditions(
        mockIniFile("test.ltx", {
          existing: {},
        }),
        "existing"
      )
    ).toEqualLuaArrays([]);

    expect(
      getConfigSwitchConditions(
        mockIniFile("test.ltx", {
          existing: {
            first: 1,
            second: "b",
          },
        }),
        "existing"
      )
    ).toEqualLuaArrays([]);
  });

  it("getConfigSwitchConditions correctly parse different listed conditions", () => {
    expect(
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
    ).toEqualLuaArrays([
      mockBaseSchemeLogic({
        v1: 3,
        name: "on_actor_dist_le",
        condlist: parseConditionsList("{=actor_has_weapon} remark"),
      }),
    ]);

    expect(
      getConfigSwitchConditions(
        mockIniFile("test.ltx", {
          existing: {
            on_actor_dist_le_nvis: "31 | {=actor_condition} value",
            on_actor_dist_ge: "55 | {=another_cond} another",
          },
        }),
        "existing"
      )
    ).toEqualLuaArrays([
      mockBaseSchemeLogic({
        v1: 31,
        name: "on_actor_dist_le_nvis",
        condlist: parseConditionsList("{=actor_condition} value"),
      }),
      mockBaseSchemeLogic({
        v1: 55,
        name: "on_actor_dist_ge",
        condlist: parseConditionsList("{=another_cond} another"),
      }),
    ]);

    const serverObject: ServerObject = mockServerAlifeObject();

    registerStoryLink(serverObject.id, "test-cfg-sid");

    expect(
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
    ).toEqualLuaArrays([
      mockBaseSchemeLogic({
        v1: 100,
        name: "on_actor_dist_ge_nvis",
        condlist: parseConditionsList("test1"),
      }),
      mockBaseSchemeLogic({
        v1: "anim_end",
        name: "on_signal",
        condlist: parseConditionsList("test2"),
      }),
      mockBaseSchemeLogic({
        name: "on_info",
        condlist: parseConditionsList("{+pri_a28_infop} test3"),
      }),
      mockBaseSchemeLogic({
        v1: 50,
        name: "on_timer",
        condlist: parseConditionsList("test4"),
      }),
      mockBaseSchemeLogic({
        v1: 10,
        name: "on_game_timer",
        condlist: parseConditionsList("test5"),
      }),
      mockBaseSchemeLogic({
        v1: "zat_b38",
        name: "on_actor_in_zone",
        condlist: parseConditionsList("test7"),
      }),
      mockBaseSchemeLogic({
        v1: "zat_b38",
        name: "on_actor_not_in_zone",
        condlist: parseConditionsList("test8"),
      }),
      mockBaseSchemeLogic({
        name: "on_actor_inside",
        condlist: parseConditionsList("test9"),
      }),
      mockBaseSchemeLogic({
        name: "on_actor_outside",
        condlist: parseConditionsList("test10"),
      }),
      mockBaseSchemeLogic({
        v1: "test-cfg-sid",
        v2: "jup_hide_a6",
        objectId: serverObject.id,
        name: "on_npc_in_zone",
        condlist: parseConditionsList("test11"),
      }),
      mockBaseSchemeLogic({
        v1: "test-cfg-sid",
        v2: "jup_hide_a6",
        objectId: serverObject.id,
        name: "on_npc_not_in_zone",
        condlist: parseConditionsList("test12"),
      }),
    ]);
  });
});
