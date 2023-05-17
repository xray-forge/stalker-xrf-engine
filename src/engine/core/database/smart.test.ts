import { describe, expect, it } from "@jest/globals";
import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database/registry";
import {
  registerSmartCover,
  registerSmartTerrain,
  unregisterSmartCover,
  unregisterSmartTerrain,
} from "@/engine/core/database/smart";
import { SmartCover, SmartTerrain } from "@/engine/core/objects";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'smart' module of the database", () => {
  it("should correctly register smart terrain", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test");
    const smartObject: XR_game_object = mockClientGameObject();

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
});
