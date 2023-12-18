import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import {
  BOX_METAL_01,
  BOX_SCIENCE,
  BOX_SMALL_GENERIC,
  BOX_WOOD_01,
  BOX_WOOD_02,
  boxConfig,
} from "@/engine/core/managers/box/BoxConfig";
import { BoxManager } from "@/engine/core/managers/box/BoxManager";
import { getObjectPositioning } from "@/engine/core/utils/position";
import { spawnItemsAtPosition } from "@/engine/core/utils/spawn";
import { copyVector } from "@/engine/core/utils/vector";
import { GameObject, IniFile } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/spawn");

describe("BoxManager class", () => {
  beforeEach(() => {
    resetRegistry();

    boxConfig.DROP_ITEMS_BY_SECTION = new LuaTable();
    boxConfig.DROP_RATE_BY_LEVEL = new LuaTable();
    boxConfig.DROP_COUNT_BY_LEVEL = new LuaTable();
  });

  it("should correctly initialize", () => {
    getManager(BoxManager);

    expect(boxConfig.DROP_ITEMS_BY_SECTION.length()).toBe(9);
    expect(boxConfig.DROP_RATE_BY_LEVEL.length()).toBe(4);
    expect(boxConfig.DROP_COUNT_BY_LEVEL.length()).toBe(3);
  });

  it("spawnBoxObjectItems should correctly spawn drop box items when have strict box definition", async () => {
    const manager: BoxManager = getManager(BoxManager);
    const object: GameObject = MockGameObject.mock();
    const spawnIni: IniFile = MockIniFile.mock("test.ltx", {
      drop_box: {
        community: BOX_SCIENCE,
      },
    });

    jest.spyOn(object, "spawn_ini").mockImplementation(() => spawnIni);
    jest.spyOn(manager, "spawnBoxObjectItemsFromList").mockImplementation(jest.fn());

    manager.spawnBoxObjectItems(object);

    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledTimes(1);
    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledWith(
      object,
      boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SCIENCE)
    );
  });

  it("spawnBoxObjectItems should correctly spawn drop box items when have use one of generic boxes", async () => {
    const manager: BoxManager = getManager(BoxManager);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();
    const fourth: GameObject = MockGameObject.mock();

    jest.spyOn(manager, "spawnBoxObjectItemsFromList").mockImplementation(jest.fn());

    jest.spyOn(first, "spawn_ini").mockImplementation(() => null as unknown as IniFile);
    jest.spyOn(first, "get_visual_name").mockImplementationOnce(() => BOX_METAL_01);
    jest.spyOn(second, "spawn_ini").mockImplementation(() => null as unknown as IniFile);
    jest.spyOn(second, "get_visual_name").mockImplementationOnce(() => BOX_WOOD_01);
    jest.spyOn(third, "spawn_ini").mockImplementation(() => null as unknown as IniFile);
    jest.spyOn(third, "get_visual_name").mockImplementationOnce(() => BOX_WOOD_02);
    jest.spyOn(fourth, "spawn_ini").mockImplementation(() => null as unknown as IniFile);

    jest.spyOn(math, "random").mockImplementationOnce(() => 0);
    manager.spawnBoxObjectItems(first);

    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledTimes(1);
    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledWith(
      first,
      boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SMALL_GENERIC)
    );

    jest.spyOn(math, "random").mockImplementationOnce(() => 0);
    manager.spawnBoxObjectItems(second);

    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledTimes(2);
    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledWith(
      second,
      boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SMALL_GENERIC)
    );

    jest.spyOn(math, "random").mockImplementationOnce(() => 0);
    manager.spawnBoxObjectItems(third);

    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledTimes(3);
    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledWith(
      third,
      boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SMALL_GENERIC)
    );

    jest.spyOn(math, "random").mockImplementationOnce(() => 0);
    manager.spawnBoxObjectItems(fourth);

    expect(manager.spawnBoxObjectItemsFromList).toHaveBeenCalledTimes(3);
  });

  it("spawnBoxObjectItemsFromList should correctly spawn drop box items", async () => {
    const manager: BoxManager = getManager(BoxManager);
    const object: GameObject = MockGameObject.mock();

    const [, gvid, lvid, position] = getObjectPositioning(object);
    const destination = { ...copyVector(position), y: expect.any(Number) };

    manager.spawnBoxObjectItems(object);

    expect(spawnItemsAtPosition).toHaveBeenCalledTimes(3);
    expect(spawnItemsAtPosition).toHaveBeenCalledWith(
      "ammo_9x19_pbp",
      gvid,
      lvid,
      destination,
      expect.any(Number),
      100
    );
    expect(spawnItemsAtPosition).toHaveBeenCalledWith(
      "ammo_9x18_pmm",
      gvid,
      lvid,
      destination,
      expect.any(Number),
      100
    );
    expect(spawnItemsAtPosition).toHaveBeenCalledWith(
      "ammo_9x19_pbp",
      gvid,
      lvid,
      destination,
      expect.any(Number),
      100
    );
  });
});
