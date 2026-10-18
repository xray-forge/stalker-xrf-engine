import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import { EGameHook, registerGameHook } from "@/engine/core/hooks";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import {
  getSmartTerrainDiscoveryRejection,
  isSmartTerrainVisited,
} from "@/engine/core/managers/map/utils/map_terrain_discovery";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

afterEach(() => {
  mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT = false;
});

describe("getSmartTerrainDiscoveryRejection", () => {
  it("should know every terrain unless the config requires a visit", () => {
    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBeNull();

    mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT = true;

    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBe("not visited");

    giveInfoPortion("zat_b55_visited");

    expect(isSmartTerrainVisited("zat_b55")).toBe(true);
    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBeNull();
  });

  it("should name the reason a discovery hook gives", () => {
    registerGameHook(EGameHook.SMART_TERRAIN_DISCOVERY, (name) => (name === "zat_b55" ? "hidden" : null), {
      owner: "test",
    });

    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBe("hidden");
    expect(getSmartTerrainDiscoveryRejection("zat_b100")).toBeNull();
  });
});
