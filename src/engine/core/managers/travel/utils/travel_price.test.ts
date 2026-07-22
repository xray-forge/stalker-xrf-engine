import { beforeEach, describe, expect, it } from "@jest/globals";
import { MockAlifeOnlineOfflineGroup, MockAlifeSmartZone, MockVector } from "xray16/mocks";

import { getTravelPriceByDistance, getTravelPriceForSquad } from "@/engine/core/managers/travel/utils/travel_price";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { resetRegistry } from "@/fixtures/engine";

describe("getTravelPriceByDistance", () => {
  it("should round each travel distance up to the next fifty currency units", () => {
    expect(getTravelPriceByDistance(10)).toBe(50);
    expect(getTravelPriceByDistance(100)).toBe(100);
    expect(getTravelPriceByDistance(500)).toBe(500);
    expect(getTravelPriceByDistance(750)).toBe(750);
    expect(getTravelPriceByDistance(1500)).toBe(1500);
  });
});

describe("getTravelPriceForSquad", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should calculate price from the squad and terrain server distance", () => {
    const squad: Squad = MockAlifeOnlineOfflineGroup.mock({ gameVertexId: 100 }) as Squad;
    const terrain: SmartTerrain = MockAlifeSmartZone.mock({ gameVertexId: 101 }) as SmartTerrain;

    MockVector.DEFAULT_DISTANCE = 510;

    expect(getTravelPriceForSquad(squad, terrain)).toBe(550);
  });
});
