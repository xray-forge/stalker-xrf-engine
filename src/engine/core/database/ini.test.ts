import { describe, expect, it } from "@jest/globals";
import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { getObjectLogicIniConfig, loadDynamicIni } from "@/engine/core/database/ini";
import { DUMMY_LTX } from "@/engine/core/database/ini_registry";
import { registerObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'ini' module of database", () => {
  it("should correctly create dynamic ini files", () => {
    expect(() => loadDynamicIni("test.ltx")).toThrow();
    expect(() => loadDynamicIni("*test.ltx")).toThrow();

    const [first, firstName] = loadDynamicIni(
      "test.ltx",
      JSON.stringify({
        test: {
          a: 1,
          b: "another",
          c: false,
        },
      })
    );

    expect(first instanceof ini_file).toBeTruthy();
    expect(firstName).toBe("*test.ltx");
    expect(first.r_u32("test", "a")).toBe(1);
    expect(first.r_string("test", "b")).toBe("another");
    expect(first.r_bool("test", "c")).toBe(false);

    const [second, secondName] = loadDynamicIni("test.ltx");

    expect(first).toBe(second);
    expect(firstName).toBe(secondName);

    expect(registry.ini.length()).toBe(1);
  });

  it("should correctly load object logic ini file", () => {
    const withSpawnIni: XR_game_object = mockClientGameObject();
    const withoutSpawnIni: XR_game_object = mockClientGameObject({ spawn_ini: () => null as unknown as XR_ini_file });

    expect(getObjectLogicIniConfig(withSpawnIni, "<customdata>")).toBe(withSpawnIni.spawn_ini());
    expect(getObjectLogicIniConfig(withoutSpawnIni, "<customdata>")).toBe(DUMMY_LTX);
    expect(getObjectLogicIniConfig(withoutSpawnIni, "new_one.ltx").fname()).toBe("new_one.ltx");
    expect(getObjectLogicIniConfig(withoutSpawnIni, "another_one.ltx").fname()).toBe("another_one.ltx");

    expect(() => getObjectLogicIniConfig(withSpawnIni, "*new_one.ltx")).toThrow();

    registerObject(withSpawnIni);

    const [dynamicLtx, dynamicLtxName] = loadDynamicIni("config.ltx", JSON.stringify({ test: { a: 1, b: "test" } }));
    const logicIni: XR_ini_file = getObjectLogicIniConfig(withSpawnIni, dynamicLtxName);

    expect(dynamicLtx).toBe(logicIni);

    const another: XR_game_object = mockClientGameObject();
    const anotherState: IRegistryObjectState = registerObject(another);

    anotherState.job_ini = "jobExample.ltx";

    expect(getObjectLogicIniConfig(another, "*jobExample.ltx").fname()).toBe("jobExample.ltx");
  });
});
