import { describe, expect, it } from "@jest/globals";

import { IBaseSchemeLogic } from "@/engine/core/schemes";
import {
  getTwoNumbers,
  readConfigNumberAndConditionList,
  readIniBoolean,
  readIniConditionList,
  readIniNumber,
  readIniString,
} from "@/engine/core/utils/ini/getters";
import { getSchemeByIniSection } from "@/engine/core/utils/ini/parse";
import { IniFile, Optional } from "@/engine/lib/types";
import { luaTableToObject } from "@/fixtures/lua/mocks/utils";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("'getters' utils for ini file", () => {
  it("'readIniString' utils should correctly get data from ini files", () => {
    const ini: IniFile = mockIniFile("example.ltx", {
      section1: {
        a: "a1",
        b: "b2",
      },
    });

    expect(readIniString(ini, "section1", "a", true)).toBe("a1");
    expect(readIniString(ini, "section1", "b", true)).toBe("b2");

    expect(readIniString(ini, "section1", "c", false)).toBeNull();
    expect(readIniString(ini, "section1", "c", false, null, "def")).toBe("def");
    expect(() => readIniString(ini, "section1", "c", true)).toThrow();

    expect(() => readIniString(ini, "section2", "a", true)).toThrow();
    expect(() => readIniString(ini, "section2", "a", false)).not.toThrow();
  });

  it("'readIniNumber' utils should correctly get data from ini files", () => {
    const ini: IniFile = mockIniFile("example.ltx", {
      section1: {
        a: 1,
        b: 2,
      },
    });

    expect(readIniNumber(ini, "section1", "a", true)).toBe(1);
    expect(readIniNumber(ini, "section1", "b", true)).toBe(2);

    expect(readIniNumber(ini, "section1", "c", false)).toBeNull();
    expect(readIniNumber(ini, "section1", "c", false, 3)).toBe(3);
  });

  it("'readIniBoolean' utils should correctly get data from ini files", () => {
    const ini: IniFile = mockIniFile("example.ltx", {
      section1: {
        a: true,
        b: false,
      },
    });

    expect(readIniBoolean(ini, "section1", "a", true)).toBe(true);
    expect(readIniBoolean(ini, "section1", "b", true)).toBe(false);
    expect(readIniBoolean(ini, "section1", "c", false)).toBe(false);
    expect(readIniBoolean(ini, "section1", "c", false, true)).toBe(true);

    expect(() => readIniBoolean(ini, "section2", "a", true)).toThrow();
    expect(() => readIniBoolean(ini, "section2", "a", false)).not.toThrow();
  });

  it("'getTwoNumbers' util should get two numbers correctly", () => {
    const ini: IniFile = mockIniFile("example.ltx", {
      section1: {
        a: "-4.3, 2",
        b: "10 -5",
        c: "10",
        d: "",
      },
    });

    expect(getTwoNumbers(ini, "section1", "a", 1, 1)).toEqual([-4.3, 2]);
    expect(getTwoNumbers(ini, "section1", "b", 1, 1)).toEqual([10, -5]);
    expect(getTwoNumbers(ini, "section1", "c", 1, 1)).toEqual([10, 1]);
    expect(getTwoNumbers(ini, "section1", "d", 1, 1)).toEqual([1, 1]);
    expect(getTwoNumbers(ini, "section1", "e", 1, 1)).toEqual([1, 1]);
  });

  it("'readIniConditionList' should correctly parse data", () => {
    const ini: IniFile = mockIniFile("example.ltx", {
      section1: {
        a:
          "ph_idle@sound %=anim_obj_forward(pas_b400_door_way) =heal_squad(pas_b400_stalkers_squad)" +
          " +pas_b400_way_button_pressed -pas_b400_about_gates%",
        b: "{-lx8_scentific_door_open} ph_door@open %+lx8_scentific_door_open%, ph_door@open",
      },
    });

    const firstScheme: Optional<IBaseSchemeLogic> = readIniConditionList(ini, "section1", "a");

    expect(luaTableToObject(firstScheme)).toEqual({
      name: "a",
      condlist: {
        "1": {
          section: "ph_idle@sound ",
          infop_check: {},
          infop_set: {
            "1": { func: "anim_obj_forward", expected: true, params: { "1": "pas_b400_door_way" } },
            "2": { func: "heal_squad", expected: true, params: { "1": "pas_b400_stalkers_squad" } },
            "3": { name: "pas_b400_way_button_pressed", required: true },
            "4": { name: "pas_b400_about_gates", required: false },
          },
        },
      },
      npc_id: null,
      v1: null,
      v2: null,
    });

    const secondScheme: Optional<IBaseSchemeLogic> = readIniConditionList(ini, "section1", "b");

    expect(luaTableToObject(secondScheme)).toEqual({
      name: "b",
      condlist: {
        "1": {
          section: "ph_door@open ",
          infop_check: { "1": { name: "lx8_scentific_door_open", required: false } },
          infop_set: { "1": { name: "lx8_scentific_door_open", required: true } },
        },
        "2": { section: "ph_door@open", infop_check: {}, infop_set: {} },
      },
      npc_id: null,
      v1: null,
      v2: null,
    });
  });

  it("'getSchemeByIniSection' should correctly return scheme", () => {
    expect(getSchemeByIniSection("test")).toBe("test");
    expect(getSchemeByIniSection("test@example")).toBe("test");
    expect(getSchemeByIniSection("combat@first")).toBe("combat");
    expect(getSchemeByIniSection("")).toBeNull();
    expect(getSchemeByIniSection("@")).toBeNull();
    expect(getSchemeByIniSection("@abc")).toBeNull();
  });

  it("'getConfigNumberAndConditionList' should correctly parse data", () => {
    const ini: IniFile = mockIniFile("example.ltx", {
      section1: {
        a: "5 | {-jup_b19_actor_damaged_zombied} %+jup_b19_actor_damaged_zombied%",
        b: "150 | {-jup_b4_actor_go_away} %+jup_b4_actor_go_away%",
      },
    });

    expect(luaTableToObject(readConfigNumberAndConditionList(ini, "section1", "a"))).toEqual({
      name: "a",
      condlist: {
        "1": {
          infop_check: {
            "1": {
              name: "jup_b19_actor_damaged_zombied",
              required: false,
            },
          },
          infop_set: {
            "1": {
              name: "jup_b19_actor_damaged_zombied",
              required: true,
            },
          },
          section: "",
        },
      },

      npc_id: null,
      v1: 5,
      v2: null,
    });

    expect(luaTableToObject(readConfigNumberAndConditionList(ini, "section1", "b"))).toEqual({
      name: "b",
      condlist: {
        "1": {
          infop_check: {
            "1": {
              name: "jup_b4_actor_go_away",
              required: false,
            },
          },
          infop_set: {
            "1": {
              name: "jup_b4_actor_go_away",
              required: true,
            },
          },
          section: "",
        },
      },

      npc_id: null,
      v1: 150,
      v2: null,
    });
  });
});
