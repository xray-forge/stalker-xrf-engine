import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { TInventoryItem } from "@/engine/constants/items";
import { medkits } from "@/engine/constants/items/drugs";
import { registerSimulator, registry } from "@/engine/core/database";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { checkItemDependentDrops, createCorpseReleaseItems } from "@/engine/core/managers/drop/utils/drop_create";
import { Stalker } from "@/engine/core/objects/creature";
import { resetRegistry } from "@/fixtures/engine";

describe("createCorpseReleaseItems", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    dropConfig.ITEMS_BY_COMMUNITY = new LuaTable();
    dropConfig.ITEMS_DEPENDENCIES = new LuaTable();
    dropConfig.ITEMS_DROP_COUNT_BY_LEVEL = new LuaTable();
  });

  it("should spawn configured loot exactly once for an unregistered corpse", () => {
    const object: GameObject = MockGameObject.mockStalker();
    const stalker: Stalker = { isCorpseLootDropped: false } as Stalker;
    const items: LuaTable<TInventoryItem, number> = new LuaTable();

    items.set(medkits.medkit, 100);
    dropConfig.ITEMS_BY_COMMUNITY.set("stalker", items);
    dropConfig.ITEMS_DROP_COUNT_BY_LEVEL.set(medkits.medkit, { min: 1, max: 1 });
    replaceFunctionMock(registry.simulator.object, () => stalker);

    expect(() => createCorpseReleaseItems(object)).not.toThrow();
    expect(stalker.isCorpseLootDropped).toBe(true);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      medkits.medkit,
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );

    createCorpseReleaseItems(object);

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
  });
});

describe("checkItemDependentDrops", () => {
  beforeEach(() => {
    resetRegistry();
    dropConfig.ITEMS_DEPENDENCIES = new LuaTable();
  });

  it("should require one available dependency when a drop declares dependencies", () => {
    const object: GameObject = MockGameObject.mock();
    const dependency: GameObject = MockGameObject.mock({ section: "required_item" });
    const dependencies: LuaTable<string, boolean> = new LuaTable();

    dependencies.set("required_item", true);
    dropConfig.ITEMS_DEPENDENCIES.set("test_drop", dependencies);
    replaceFunctionMock(object.object, () => dependency);
    replaceFunctionMock(object.marked_dropped, () => false);

    expect(checkItemDependentDrops(object, "drop_without_dependencies")).toBe(true);
    expect(checkItemDependentDrops(object, "test_drop")).toBe(true);

    replaceFunctionMock(object.marked_dropped, () => true);

    expect(checkItemDependentDrops(object, "test_drop")).toBe(false);
  });
});
