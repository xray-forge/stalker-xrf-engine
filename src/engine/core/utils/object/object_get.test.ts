import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { DUMMY_LTX } from "@/engine/core/database";
import { getObjectId, getObjectSpawnIni } from "@/engine/core/utils/object/object_get";
import { GameObject, IniFile, ServerHumanObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("getObjectSpawnIni utils", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly fallback to dummy ini", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "spawn_ini").mockImplementation(() => null as unknown as IniFile);

    expect(getObjectSpawnIni(object)).toBe(DUMMY_LTX);
  });

  it("should correctly just return spawn ini without logics", () => {
    const object: GameObject = MockGameObject.mock();

    expect(getObjectSpawnIni(object)).toBe(object.spawn_ini());
  });

  it("should correctly return spawn ini from logics cfg", () => {
    const object: GameObject = MockGameObject.mock();

    MockIniFile.register("test_for_util.ltx", {});

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test_for_util.ltx", {
        logic: {
          cfg: "test_for_util.ltx",
        },
      });
    });

    expect(getObjectSpawnIni(object).fname()).toBe("test_for_util.ltx");
  });
});

describe("getObjectId util", () => {
  it("should correctly get ID from game objects", () => {
    const object: GameObject = MockGameObject.mock();

    expect(getObjectId(object)).toBe(object.id());
  });

  it("should correctly get ID from server objects", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(getObjectId(object)).toBe(object.id);
  });
});
