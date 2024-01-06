import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  IBaseSchemeLogic,
  IRegistryObjectState,
  registerActor,
  registerObject,
  registerSimulator,
  registerStoryLink,
} from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  addConditionToList,
  getConfigObjectAndZone,
  getConfigSwitchConditions,
  getObjectConfigOverrides,
  getSectionsFromConditionLists,
  parseConditionsList,
} from "@/engine/core/utils/ini";
import { NIL } from "@/engine/lib/constants/words";
import { GameObject, LuaArray, ServerObject, TIndex } from "@/engine/lib/types";
import { mockBaseSchemeLogic } from "@/fixtures/engine";
import { MockGameObject, mockIniFile, mockServerAlifeObject } from "@/fixtures/xray";

describe("getInfosFromData util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly parse data list of condition lists", () => {
    registerActor(MockGameObject.mockActor());
    giveInfoPortion("test");

    expect(getSectionsFromConditionLists(MockGameObject.mock(), "a|b|c")).toEqualLuaArrays(["a", "b", "c"]);
    expect(getSectionsFromConditionLists(MockGameObject.mock(), "a|{+not_existing}b,c|{+test}d,e")).toEqualLuaArrays([
      "a",
      "c",
      "d",
    ]);
  });
});

describe("getConfigObjectAndZone util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly parse story id and zone pair", () => {
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
      objectId: serverObject.id,
      p1: "zat_cop_id",
      p2: "zat_b38_actor_jump_down",
    });
  });
});

describe("getObjectConfigOverrides util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly parse overrides", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    expect(getObjectConfigOverrides(mockIniFile("test.ltx", { empty: {} }), "empty", object)).toEqualLuaTables({
      combatIgnore: null,
      combatIgnoreKeepWhenAttacked: false,
      combatType: null,
      scriptCombatType: null,
      maxPostCombatTime: 10,
      minPostCombatTime: 5,
      heliHunter: null,
      onCombat: null,
      onOffline: parseConditionsList(NIL),
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
      combatIgnore: {
        condlist: parseConditionsList("second"),
        name: "combat_ignore_cond",
        objectId: null,
        p1: null,
        p2: null,
      },
      combatIgnoreKeepWhenAttacked: "third",
      combatType: {
        condlist: parseConditionsList("fourth"),
        name: "combat_type",
        objectId: null,
        p1: null,
        p2: null,
      },
      scriptCombatType: null,
      heliHunter: parseConditionsList("first"),
      maxPostCombatTime: 50,
      minPostCombatTime: 10,
      onCombat: {
        condlist: parseConditionsList("fifth"),
        name: "on_combat",
        objectId: null,
        p1: null,
        p2: null,
      },
      onOffline: parseConditionsList("sixth"),
      soundgroup: "seventh",
    });

    state.sectionLogic = "logic";

    expect(
      getObjectConfigOverrides(
        mockIniFile("test.ltx", {
          empty: {},
          logic: {
            post_combat_time: "15, 54",
          },
        }),
        "empty",
        object
      )
    ).toEqualLuaTables({
      heliHunter: null,
      combatIgnore: null,
      combatIgnoreKeepWhenAttacked: false,
      combatType: null,
      scriptCombatType: null,
      maxPostCombatTime: 54,
      minPostCombatTime: 15,
      onCombat: null,
      onOffline: parseConditionsList(NIL),
      soundgroup: null,
    });
  });
});

describe("addCondition util", () => {
  beforeEach(() => registerSimulator());

  it("util should fill table and return new index", () => {
    const list: LuaArray<IBaseSchemeLogic> = new LuaTable();

    expect(addConditionToList(list, 1, null)).toBe(1);
    expect(addConditionToList(list, 2, null)).toBe(2);

    expect(list.length()).toBe(0);

    const firstIndex: TIndex = addConditionToList(list, 1, {
      condlist: new LuaTable(),
      objectId: 123,
      p1: 1,
      p2: null,
      name: "first",
    });
    const secondIndex: TIndex = addConditionToList(list, 2, {
      condlist: new LuaTable(),
      objectId: 333,
      p1: "a",
      p2: "b",
      name: "second",
    });

    expect(list.length()).toBe(2);
    expect(firstIndex).toBe(2);
    expect(secondIndex).toBe(3);

    expect(list).toEqualLuaArrays([
      mockBaseSchemeLogic({
        name: "first",
        objectId: 123,
        p1: 1,
      }),
      mockBaseSchemeLogic({
        name: "second",
        objectId: 333,
        p1: "a",
        p2: "b",
      }),
    ]);
  });
});

describe("getConfigSwitchConditions util", () => {
  beforeEach(() => registerSimulator());

  it("correctly parse empty/other ini files conditions", () => {
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

  it("correctly parse different listed conditions", () => {
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
        p1: 3,
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
        p1: 31,
        name: "on_actor_dist_le_nvis",
        condlist: parseConditionsList("{=actor_condition} value"),
      }),
      mockBaseSchemeLogic({
        p1: 55,
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
        p1: 100,
        name: "on_actor_dist_ge_nvis",
        condlist: parseConditionsList("test1"),
      }),
      mockBaseSchemeLogic({
        p1: "anim_end",
        name: "on_signal",
        condlist: parseConditionsList("test2"),
      }),
      mockBaseSchemeLogic({
        name: "on_info",
        condlist: parseConditionsList("{+pri_a28_infop} test3"),
      }),
      mockBaseSchemeLogic({
        p1: 50,
        name: "on_timer",
        condlist: parseConditionsList("test4"),
      }),
      mockBaseSchemeLogic({
        p1: 10,
        name: "on_game_timer",
        condlist: parseConditionsList("test5"),
      }),
      mockBaseSchemeLogic({
        p1: "zat_b38",
        name: "on_actor_in_zone",
        condlist: parseConditionsList("test7"),
      }),
      mockBaseSchemeLogic({
        p1: "zat_b38",
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
        p1: "test-cfg-sid",
        p2: "jup_hide_a6",
        objectId: serverObject.id,
        name: "on_npc_in_zone",
        condlist: parseConditionsList("test11"),
      }),
      mockBaseSchemeLogic({
        p1: "test-cfg-sid",
        p2: "jup_hide_a6",
        objectId: serverObject.id,
        name: "on_npc_not_in_zone",
        condlist: parseConditionsList("test12"),
      }),
    ]);
  });
});
