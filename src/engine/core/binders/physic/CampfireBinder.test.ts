import { beforeEach, describe, expect, it } from "@jest/globals";

import { CampfireBinder } from "@/engine/core/binders/physic/CampfireBinder";
import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { GameObject, ServerDynamicObject, ZoneCampfire } from "@/engine/lib/types";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockCZoneCampfire, MockGameObject, MockObjectBinder, mockServerAlifeDynamicObject } from "@/fixtures/xray";

describe("CampfireBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly register and unregister campfire without links", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const binder: CampfireBinder = new CampfireBinder(MockGameObject.mock({ get_campfire: () => campfire }));
    const campfireServer: ServerDynamicObject = mockServerAlifeDynamicObject({ id: binder.object.id() });

    smartTerrain.on_before_register();

    binder.net_spawn(campfireServer);

    expect(binder.smartTerrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);

    binder.net_destroy();
    expect(binder.smartTerrain).toBeNull();
  });

  it("should correctly register and unregister campfire with links", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const binder: CampfireBinder = new CampfireBinder(
      MockGameObject.mock({ get_campfire: () => campfire, name: () => `_campfire_${smartTerrain.name()}` })
    );
    const campfireServer: ServerDynamicObject = mockServerAlifeDynamicObject({ id: binder.object.id() });

    smartTerrain.on_before_register();

    binder.net_spawn(campfireServer);

    expect(binder.smartTerrain).toBe(smartTerrain);
    expect(registry.objects.length()).toBe(1);
    expect(registry.smartTerrainsCampfires.length()).toBe(1);

    binder.net_destroy();

    expect(binder.smartTerrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });

  it("should correctly register and unregister when spawn check is falsy", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CampfireBinder = new CampfireBinder(object);
    const campfireServer: ServerDynamicObject = mockServerAlifeDynamicObject({ id: binder.object.id() });

    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(campfireServer);

    expect(binder.smartTerrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });
});
