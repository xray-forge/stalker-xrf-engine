import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { DUMMY_LTX, registerActor } from "@/engine/core/database";
import {
  getObjectSpawnIni,
  setupObjectInfoPortions,
  setupObjectStalkerVisual,
} from "@/engine/core/utils/object/object_setup";
import { GameObject, IniFile } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { expectCallsToEqual } from "@/fixtures/jest";
import { FILES_MOCKS, MockGameObject, mockIniFile } from "@/fixtures/xray";

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

    FILES_MOCKS["test_for_util.ltx"] = mockIniFile("test_for_util.ltx", {});

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test_for_util.ltx", {
        logic: {
          cfg: "test_for_util.ltx",
        },
      });
    });

    expect(getObjectSpawnIni(object).fname()).toBe("test_for_util.ltx");
  });
});

describe("setupObjectVisual utils", () => {
  it("should setup visuals", () => {
    const stalkerNone: GameObject = MockGameObject.mock({ section: <T>() => "stalker_none_1" as T });
    const stalkerFreedom: GameObject = MockGameObject.mock({ section: <T>() => "stalker_freedom_1" as T });
    const stalkerActor: GameObject = MockGameObject.mock({ section: <T>() => "stalker_actor_1" as T });

    registerActor(MockGameObject.mockActor());

    setupObjectStalkerVisual(stalkerNone);
    expect(stalkerNone.set_visual_name).not.toHaveBeenCalled();

    setupObjectStalkerVisual(stalkerFreedom);
    expect(stalkerFreedom.set_visual_name).toHaveBeenCalledWith("actors\\stalker_neutral\\stalker_neutral_2");

    setupObjectStalkerVisual(stalkerActor);
    expect(stalkerActor.set_visual_name).toHaveBeenCalledWith("some_actor_visual");
  });
});

describe("setupObjectInfoPortions utils", () => {
  it("should setup info portions", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    setupObjectInfoPortions(first, mockIniFile("test.ltx", {}));

    expect(first.give_info_portion).not.toHaveBeenCalled();

    setupObjectInfoPortions(
      first,
      mockIniFile("test.ltx", {
        known_info: ["a", "b", "c"],
      })
    );
    expect(first.give_info_portion).toHaveBeenCalledTimes(3);
    expectCallsToEqual(first.give_info_portion, [["a"], ["b"], ["c"]]);

    setupObjectInfoPortions(
      second,
      mockIniFile("test.ltx", {
        custom_section: ["d", "e"],
      }),
      "custom_section"
    );
    expect(second.give_info_portion).toHaveBeenCalledTimes(2);
    expectCallsToEqual(second.give_info_portion, [["d"], ["e"]]);
  });
});
