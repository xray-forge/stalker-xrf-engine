import { beforeEach, describe, expect, it } from "@jest/globals";
import { TName, TRate } from "xray16/lib";
import { $fromObject } from "xray16/macros";

import { registerSimulator } from "@/engine/core/database";
import { assignSimulationSquadToTerrain, destroySimulationData } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { resetPositionCache } from "@/engine/core/utils/position";
import { IDynamicZoneBases } from "@/engine/extensions/dynamic_zone/dynamic_zone_bases";
import {
  DYNAMIC_ZONE_BASE_PROTECTION,
  getDynamicZoneHuntingRejection,
} from "@/engine/extensions/dynamic_zone/dynamic_zone_hunting";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
  destroySimulationData();
  resetPositionCache();
});

describe("getDynamicZoneHuntingRejection", () => {
  it("should refuse hunting protected squads and leave other targets to other rules", () => {
    const bases: IDynamicZoneBases = { protectionRadiusSqr: 22_500, terrains: null };
    const base: SmartTerrain = MockSmartTerrain.mockRegistered("test_base");
    const hunter: MockSquad = MockSquad.mock();
    const resident: MockSquad = MockSquad.mock();
    const passer: MockSquad = MockSquad.mock();

    base.simulationProperties = $fromObject<TName, TRate>({ base: 1 });
    assignSimulationSquadToTerrain(resident, base.id);
    passer.mockSetGameVertexId(330);

    expect(getDynamicZoneHuntingRejection.call(bases, base, hunter)).toBeNull();
    expect(bases.terrains).toBeNull();
    expect(getDynamicZoneHuntingRejection.call(bases, resident, hunter)).toBe(DYNAMIC_ZONE_BASE_PROTECTION);
    expect(getDynamicZoneHuntingRejection.call(bases, passer, hunter)).toBeNull();
  });
});
