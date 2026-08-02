import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerZone } from "@/engine/core/database";
import { getSimulationTerrainDescriptorById } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { callXrCondition, mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
});
beforeAll(() => {
  require("@/engine/declarations/conditions/object/squads_in_zone_b41");
});

describe("squads_in_zone_b41", () => {
  it("should require every assigned squad member to be inside the light zone", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered("jup_b41");
    const squad: MockSquad = MockSquad.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const zone: GameObject = MockGameObject.mock({ name: "jup_b41_sr_light" });

    squad.mockAddMember(member);
    getSimulationTerrainDescriptorById(terrain.id)!.assignedSquads.set(squad.id, squad);
    registerZone(zone);
    jest.spyOn(zone, "inside").mockReturnValue(true);

    expect(callXrCondition("squads_in_zone_b41", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);

    jest.spyOn(zone, "inside").mockReturnValue(false);
    expect(callXrCondition("squads_in_zone_b41", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
  });
});
