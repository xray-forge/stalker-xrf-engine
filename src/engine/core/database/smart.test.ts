import { beforeEach, describe, expect, it } from "@jest/globals";

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
import { mockSmartTerrain } from "@/fixtures/engine";
import { MockCZoneCampfire, mockGameObject } from "@/fixtures/xray";

describe("smart module of the database", () => {
  beforeEach(() => {
    registry.objects = new LuaTable();
  });

  it("should correctly register smart terrain", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const smartObject: GameObject = mockGameObject();

    registerSmartTerrain(smartObject, smartTerrain);

    expect(registry.smartTerrains.get(smartTerrain.id)).toBe(smartTerrain);
    expect(registry.smartTerrains.length()).toBe(1);
    expect(registry.zones.get(smartObject.name())).toBe(smartObject);
    expect(registry.zones.length()).toBe(1);
    expect(registry.objects.get(smartObject.id())).toEqual({ object: smartObject });
    expect(registry.objects.length()).toBe(1);

    unregisterSmartTerrain(smartObject, smartTerrain);

    expect(registry.smartTerrains.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly register smart cover", () => {
    const smartCover: SmartCover = new SmartCover("test");

    registerSmartCover(smartCover);

    expect(registry.smartCovers.get(smartCover.name())).toBe(smartCover);
    expect(registry.smartCovers.length()).toBe(1);

    unregisterSmartCover(smartCover);

    expect(registry.smartCovers.length()).toBe(0);
  });

  it("should correctly register smart terrains campfires", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const campfireObject: GameObject = mockGameObject({ get_campfire: () => campfire });

    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);

    registerSmartTerrainCampfire(smartTerrain, campfireObject);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(campfireObject.id())).toBeDefined();
    expect(registry.smartTerrainsCampfires.length()).toBe(1);
    expect(registry.smartTerrainsCampfires.get(smartTerrain.name()).length()).toBe(1);
    expect(registry.smartTerrainsCampfires.get(smartTerrain.name())).toEqualLuaTables({
      [campfireObject.id()]: campfireObject.get_campfire(),
    });

    unRegisterSmartTerrainCampfire(smartTerrain, campfireObject);

    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });
});
