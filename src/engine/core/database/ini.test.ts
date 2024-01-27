import { beforeEach, describe, expect, it } from "@jest/globals";

import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { getObjectLogicIniConfig, loadDynamicIniFile, loadIniFile } from "@/engine/core/database/ini";
import { DUMMY_LTX } from "@/engine/core/database/ini_registry";
import { registerObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { GameObject, IniFile } from "@/engine/lib/types";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("ini module of database", () => {
  beforeEach(() => {
    registry.ini = new LuaTable();
  });

  it("should correctly create dynamic ini files", () => {
    expect(() => loadDynamicIniFile("test.ltx")).toThrow();
    expect(() => loadDynamicIniFile("*test.ltx")).toThrow();

    const [first, firstName] = loadDynamicIniFile(
      "test.ltx",
      JSON.stringify({
        test: {
          a: 1,
          b: "another",
          c: false,
        },
      })
    );

    expect(first instanceof MockIniFile).toBeTruthy();
    expect(firstName).toBe("*test.ltx");
    expect(first.r_u32("test", "a")).toBe(1);
    expect(first.r_string("test", "b")).toBe("another");
    expect(first.r_bool("test", "c")).toBe(false);

    const [second, secondName] = loadDynamicIniFile("test.ltx");

    expect(first).toBe(second);
    expect(firstName).toBe(secondName);

    expect(registry.ini.length()).toBe(1);
  });

  it("should correctly open static ini files", () => {
    expect(registry.ini.length()).toBe(0);

    expect(() => loadIniFile("test1.ltx")).not.toThrow();
    expect(() => loadIniFile("test2.ltx")).not.toThrow();

    expect(registry.ini.length()).toBe(2);
    expect(loadIniFile("test1.ltx")).toBe(loadIniFile("test1.ltx"));
    expect(loadIniFile("test2.ltx")).toBe(loadIniFile("test2.ltx"));
    expect(loadIniFile("test1.ltx")).not.toBe(loadIniFile("test2.ltx"));

    const iniFile: IniFile = loadIniFile("test3.ltx");

    expect(iniFile instanceof MockIniFile).toBeTruthy();
    expect(iniFile.fname()).toBe("test3.ltx");

    expect(registry.ini.length()).toBe(3);
  });

  it("should correctly load object logic ini file", () => {
    const withSpawnIni: GameObject = MockGameObject.mock();
    const withoutSpawnIni: GameObject = MockGameObject.mock({ spawnIni: null });

    expect(getObjectLogicIniConfig(withSpawnIni, "<customdata>")).toBe(withSpawnIni.spawn_ini());
    expect(getObjectLogicIniConfig(withoutSpawnIni, "<customdata>")).toBe(DUMMY_LTX);
    expect(getObjectLogicIniConfig(withoutSpawnIni, "new_one.ltx").fname()).toBe("new_one.ltx");
    expect(getObjectLogicIniConfig(withoutSpawnIni, "another_one.ltx").fname()).toBe("another_one.ltx");

    expect(() => getObjectLogicIniConfig(withSpawnIni, "*new_one.ltx")).toThrow();

    registerObject(withSpawnIni);

    const [dynamicLtx, dynamicLtxName] = loadDynamicIniFile(
      "config.ltx",
      JSON.stringify({ test: { a: 1, b: "test" } })
    );
    const logicIni: IniFile = getObjectLogicIniConfig(withSpawnIni, dynamicLtxName);

    expect(dynamicLtx).toBe(logicIni);

    const another: GameObject = MockGameObject.mock();
    const anotherState: IRegistryObjectState = registerObject(another);

    anotherState.jobIni = "jobExample.ltx";

    expect(getObjectLogicIniConfig(another, "*jobExample.ltx").fname()).toBe("jobExample.ltx");
  });
});
