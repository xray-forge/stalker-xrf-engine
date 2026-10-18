import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TName, TRate } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { MockIniFile } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { assignSimulationSquadToTerrain, destroySimulationData } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { resetPositionCache } from "@/engine/core/utils/position";
import {
  createDynamicZoneBases,
  IDynamicZoneBases,
  isDynamicZoneSquadProtected,
} from "@/engine/extensions/dynamic_zone/dynamic_zone_bases";
import { readDynamicZoneConfig } from "@/engine/extensions/dynamic_zone/dynamic_zone_config";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
  destroySimulationData();
  resetPositionCache();
});

describe("createDynamicZoneBases", () => {
  it("should keep the protection radius squared, collecting bases on first use", () => {
    expect(
      createDynamicZoneBases(
        readDynamicZoneConfig(MockIniFile.mock("main.ltx", { hunting: { base_protection_radius: 150 } }))
      )
    ).toEqual({ protectionRadiusSqr: 22_500, terrains: null });
  });
});

describe("isDynamicZoneSquadProtected", () => {
  it("should protect a squad assigned to a base, or standing near one on its level", () => {
    const bases: IDynamicZoneBases = { protectionRadiusSqr: 22_500, terrains: null };
    const base: SmartTerrain = MockSmartTerrain.mockRegistered("test_base");
    const resident: MockSquad = MockSquad.mock();
    const passer: MockSquad = MockSquad.mock();

    base.simulationProperties = $fromObject<TName, TRate>({ base: 1 });
    MockSmartTerrain.mockRegistered("test_other");
    assignSimulationSquadToTerrain(resident, base.id);

    const distance = jest.spyOn(passer.position, "distance_to_sqr").mockImplementation(() => 22_500);

    expect(isDynamicZoneSquadProtected(bases, resident)).toBe(true);
    expect(isDynamicZoneSquadProtected(bases, passer)).toBe(true);
    expect(bases.terrains).toEqualLuaArrays([base]);

    distance.mockImplementation(() => 22_501);

    expect(isDynamicZoneSquadProtected(bases, passer)).toBe(false);

    distance.mockImplementation(() => 0);
    passer.mockSetGameVertexId(330);

    expect(isDynamicZoneSquadProtected(bases, passer)).toBe(false);
  });
});
