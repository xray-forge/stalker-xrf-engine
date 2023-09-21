import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator, registry } from "@/engine/core/database";
import {
  evaluateSimulationPriority,
  evaluateSimulationPriorityByDistance,
  setStableAlifeObjectsUpdate,
  setUnlimitedAlifeObjectsUpdate,
} from "@/engine/core/utils/object/object_alife";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";
import { mockSquad } from "@/fixtures/xray/mocks/objects/server/Squad.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("alife utils", () => {
  beforeEach(() => registerSimulator());

  it("evaluateSimulationPriorityByDistance utils should correctly evaluate priority by distance", () => {
    MockVector.DEFAULT_DISTANCE = 20;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.05);

    MockVector.DEFAULT_DISTANCE = 10;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.1);

    MockVector.DEFAULT_DISTANCE = 5;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.2);
  });

  it("evaluateSimulationPriority utils should correctly evaluate priority", () => {
    MockVector.DEFAULT_DISTANCE = 20;

    expect(evaluateSimulationPriority(mockSquad(), mockSquad())).toBe(13.65);

    MockVector.DEFAULT_DISTANCE = 10;

    expect(
      evaluateSimulationPriority(
        mockSquad({ behaviour: mockLuaTable([["a", "5"]]), simulationProperties: { a: 6 } }),
        mockSquad()
      )
    ).toBe(29.700000000000003);
  });

  it("setUnlimitedAlifeObjectsUpdate should correctly set high updates limits", () => {
    resetFunctionMock(registry.simulator.set_objects_per_update);
    setUnlimitedAlifeObjectsUpdate();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(2_147_483_647);
  });

  it("setStableAlifeObjectsUpdate should correctly set high updates limits", () => {
    resetFunctionMock(registry.simulator.set_objects_per_update);
    setStableAlifeObjectsUpdate();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(20);
  });
});
