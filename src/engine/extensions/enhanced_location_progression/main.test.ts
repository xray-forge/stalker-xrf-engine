import { beforeEach, describe, expect, it } from "@jest/globals";

import { EGameHook, EGameHookPhase, getGameHookRegistrations } from "@/engine/core/hooks";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { getSmartTerrainDiscoveryRejection } from "@/engine/core/managers/map/utils/map_terrain_discovery";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  getLocationProgressionRejection,
  name,
  register,
} from "@/engine/extensions/enhanced_location_progression/main";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

describe("enhanced location progression", () => {
  it("should keep unvisited terrains unknown through the hook, leaving the core config alone", () => {
    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBeNull();

    register();

    expect(mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT).toBe(false);
    expect(getGameHookRegistrations(EGameHook.SMART_TERRAIN_DISCOVERY)).toEqualLuaArrays([
      { handler: getLocationProgressionRejection, context: false, owner: name, phase: EGameHookPhase.ADJUST },
    ]);
    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBe("not visited");

    giveInfoPortion("zat_b55_visited");

    expect(getSmartTerrainDiscoveryRejection("zat_b55")).toBeNull();
  });
});
