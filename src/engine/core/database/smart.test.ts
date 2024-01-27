import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import {
  registerSmartCover,
  registerSmartTerrain,
  registerSmartTerrainCampfire,
  unregisterSmartCover,
  unregisterSmartTerrain,
  unRegisterSmartTerrainCampfire,
} from "@/engine/core/database/smart";
import { SmartCover } from "@/engine/core/objects/smart_cover";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { GameObject, ZoneCampfire } from "@/engine/lib/types";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockCZoneCampfire, MockGameObject } from "@/fixtures/xray";

describe("smart module of the database", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly register smart terrain", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock();

    registerSmartTerrain(object, terrain);

    expect(registry.smartTerrains.get(terrain.id)).toBe(terrain);
    expect(registry.smartTerrains.length()).toBe(1);
    expect(registry.zones.get(object.name())).toBe(object);
    expect(registry.zones.length()).toBe(1);
    expect(registry.objects.get(object.id())).toEqual({ object: object });
    expect(registry.objects.length()).toBe(1);

    unregisterSmartTerrain(object, terrain);

    expect(registry.smartTerrains.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly register smart cover", () => {
    const cover: SmartCover = new SmartCover("test");

    registerSmartCover(cover);

    expect(registry.smartCovers.get(cover.name())).toBe(cover);
    expect(registry.smartCovers.length()).toBe(1);

    unregisterSmartCover(cover);

    expect(registry.smartCovers.length()).toBe(0);
  });

  it("should correctly register smart terrains campfires", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const campfireObject: GameObject = MockGameObject.mock();

    jest.spyOn(campfireObject, "get_campfire").mockImplementation(() => campfire);

    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);

    registerSmartTerrainCampfire(terrain, campfireObject);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(campfireObject.id())).toBeDefined();
    expect(registry.smartTerrainsCampfires.length()).toBe(1);
    expect(registry.smartTerrainsCampfires.get(terrain.name()).length()).toBe(1);
    expect(registry.smartTerrainsCampfires.get(terrain.name())).toEqualLuaTables({
      [campfireObject.id()]: campfireObject.get_campfire(),
    });

    unRegisterSmartTerrainCampfire(terrain, campfireObject);

    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });
});
