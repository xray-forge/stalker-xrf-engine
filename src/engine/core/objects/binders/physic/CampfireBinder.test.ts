import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { CampfireBinder, SmartTerrain } from "@/engine/core/objects";
import { ServerDynamicObject, ZoneCampfire } from "@/engine/lib/types";
import { mockSmartTerrain } from "@/fixtures/engine";
import { mockClientGameObject, MockCZoneCampfire, mockServerAlifeDynamicObject } from "@/fixtures/xray";

describe("CampfireBinder class", () => {
  beforeEach(() => {
    registry.objects = new LuaTable();
  });

  it("should correctly register and unregister campfire without links", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const campfireBinder: CampfireBinder = new CampfireBinder(mockClientGameObject({ get_campfire: () => campfire }));
    const campfireServer: ServerDynamicObject = mockServerAlifeDynamicObject({ id: campfireBinder.object.id() });

    smartTerrain.on_before_register();

    campfireBinder.net_spawn(campfireServer);
    expect(campfireBinder.smartTerrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);

    campfireBinder.net_destroy();
    expect(campfireBinder.smartTerrain).toBeNull();
  });

  it("should correctly register and unregister campfire with links", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const campfire: ZoneCampfire = MockCZoneCampfire.mock(true);
    const campfireBinder: CampfireBinder = new CampfireBinder(
      mockClientGameObject({ get_campfire: () => campfire, name: () => `_campfire_${smartTerrain.name()}` })
    );
    const campfireServer: ServerDynamicObject = mockServerAlifeDynamicObject({ id: campfireBinder.object.id() });

    smartTerrain.on_before_register();

    campfireBinder.net_spawn(campfireServer);
    expect(campfireBinder.smartTerrain).toBe(smartTerrain);
    expect(registry.objects.length()).toBe(1);
    expect(registry.smartTerrainsCampfires.length()).toBe(1);

    campfireBinder.net_destroy();
    expect(campfireBinder.smartTerrain).toBeNull();
    expect(registry.objects.length()).toBe(0);
    expect(registry.smartTerrainsCampfires.length()).toBe(0);
  });
});
