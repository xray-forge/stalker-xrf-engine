import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CampfireBinder } from "@/engine/core/binders/physic/CampfireBinder";
import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { GameObject, ServerDynamicObject, ZoneCampfire } from "@/engine/lib/types";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockAlifeDynamicObject, MockCZoneCampfire, MockGameObject, MockObjectBinder } from "@/fixtures/xray";

describe("CampfireBinder", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly register and unregister campfire without links", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const binder: CampfireBinder = new CampfireBinder(MockGameObject.mock());
    const campfireServer: ServerDynamicObject = MockAlifeDynamicObject.mock({ id: binder.object.id() });

    jest.spyOn(binder.object, "get_campfire").mockImplementation(() => campfire);

    terrain.on_before_register();

    binder.net_spawn(campfireServer);

    expect(binder.terrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);

    binder.net_destroy();
    expect(binder.terrain).toBeNull();
  });

  it("should correctly register and unregister campfire with links", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const binder: CampfireBinder = new CampfireBinder(MockGameObject.mock({ name: `_campfire_${terrain.name()}` }));
    const campfireServer: ServerDynamicObject = MockAlifeDynamicObject.mock({ id: binder.object.id() });

    jest.spyOn(binder.object, "get_campfire").mockImplementation(() => campfire);

    terrain.on_before_register();

    binder.net_spawn(campfireServer);

    expect(binder.terrain).toBe(terrain);
    expect(registry.objects.length()).toBe(1);
    expect(registry.smartTerrainsCampfires.length()).toBe(1);

    binder.net_destroy();

    expect(binder.terrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });

  it("should correctly register and unregister when spawn check is falsy", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CampfireBinder = new CampfireBinder(object);
    const campfireServer: ServerDynamicObject = MockAlifeDynamicObject.mock({ id: binder.object.id() });

    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(campfireServer);

    expect(binder.terrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });
});
