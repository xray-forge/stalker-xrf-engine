import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { FALSE } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { getSimulationTerrainDescriptorById } from "@/engine/core/managers/simulation/utils";
import { callXrEffect, mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/clear_smart_terrain");
});

beforeEach(() => {
  resetRegistry();
});

describe("clear_smart_terrain", () => {
  it("should retain story-bound squads when requested", () => {
    registerSimulator();
    mockRegisteredActor();

    const terrain = MockSmartTerrain.mockRegistered("test-terrain");
    const removable: MockSquad = MockSquad.mock();
    const retained: MockSquad = MockSquad.mock();
    const removableMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const retainedMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const descriptor = getSimulationTerrainDescriptorById(terrain.id)!;

    for (const object of [removable, retained, removableMember, retainedMember]) {
      MockAlifeSimulator.addToRegistry(object);
    }

    removable.mockAddMember(removableMember);
    retained.mockAddMember(retainedMember);
    removable.assignedTerrainId = terrain.id;
    retained.assignedTerrainId = terrain.id;
    descriptor.assignedSquads.set(removable.id, removable);
    descriptor.assignedSquads.set(retained.id, retained);
    registerStoryLink(retained.id, "story-squad");

    callXrEffect("clear_smart_terrain", MockGameObject.mockActor(), MockGameObject.mock(), "test-terrain", FALSE);

    expect(registry.simulator.release).toHaveBeenCalledWith(removableMember, true);
    expect(registry.simulator.release).not.toHaveBeenCalledWith(retainedMember, true);
  });
});
