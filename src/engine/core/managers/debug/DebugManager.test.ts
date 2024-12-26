import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, SYSTEM_INI } from "@/engine/core/database";
import { DebugManager } from "@/engine/core/managers/debug/DebugManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { saveTextToFile } from "@/engine/core/utils/fs";
import { toJSON } from "@/engine/core/utils/transform";
import { AnyObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";

jest.mock("@/engine/core/utils/fs");

describe("ProfilingManager", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(saveTextToFile);
  });

  it("should correctly dump lua data without data providers", () => {
    const manager: DebugManager = getManager(DebugManager);

    manager.dumpLuaData();

    expect(saveTextToFile).toHaveBeenCalledTimes(1);
    expect(saveTextToFile).toHaveBeenCalledWith("$app_data_root$\\dumps", "lua_data.json", "{}");
  });

  it("should correctly dump lua data with data providers", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const manager: DebugManager = getManager(DebugManager);

    jest.spyOn(eventsManager, "emitEvent");

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, (data: AnyObject) => {
      data["first"] = { a: 1, b: true, c: { notEmpty: true } };
    });
    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, (data: AnyObject) => {
      data["second"] = { d: 10, e: 11, f: 12 };
    });

    const data: AnyObject = manager.dumpLuaData();

    expect(eventsManager.emitEvent).toHaveBeenCalledTimes(1);
    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.DUMP_LUA_DATA, data);

    expect(saveTextToFile).toHaveBeenCalledTimes(1);
    expect(saveTextToFile).toHaveBeenCalledWith("$app_data_root$\\dumps", "lua_data.json", toJSON(data));

    expect(data).toEqual({
      first: {
        a: 1,
        b: true,
        c: {
          notEmpty: true,
        },
      },
      second: {
        d: 10,
        e: 11,
        f: 12,
      },
    });
  });

  it("should correctly dump system ini", () => {
    const manager: DebugManager = getManager(DebugManager);

    jest.spyOn(SYSTEM_INI, "save_as");

    manager.dumpSystemIni();

    expect(SYSTEM_INI.save_as).toHaveBeenCalledTimes(1);
    expect(SYSTEM_INI.save_as).toHaveBeenCalledWith("_appdata_\\dumps\\system.ltx");
  });
});
