import { describe, expect, it } from "@jest/globals";
import { alife } from "xray16";

import {
  evaluateSimulationPriority,
  evaluateSimulationPriorityByDistance,
  isGameStarted,
} from "@/engine/core/utils/alife";
import { mockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { MockCVertex } from "@/fixtures/xray/mocks/CVertex.mock";
import { mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";
import { mockSquad } from "@/fixtures/xray/mocks/objects/server/Squad.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("'alife' utils", () => {
  it("'isGameStarted' should check alife", () => {
    expect(isGameStarted()).toBe(true);
    expect(alife()).toBeDefined();
  });

  it("'evaluateSimulationPriorityByDistance' utils should correctly evaluate priority by distance", () => {
    MockVector.DEFAULT_DISTANCE = 20;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.05);

    MockVector.DEFAULT_DISTANCE = 10;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.1);

    MockVector.DEFAULT_DISTANCE = 5;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.2);
  });

  it("'evaluateSimulationPriority' utils should correctly evaluate priority", () => {
    MockVector.DEFAULT_DISTANCE = 20;
    MockCVertex.DEFAULT_LEVEL_ID = 5;

    expect(evaluateSimulationPriority(mockSquad(), mockSquad())).toBe(13.65);

    MockVector.DEFAULT_DISTANCE = 10;

    expect(
      evaluateSimulationPriority(
        mockSquad({ behaviour: mockLuaTable([["a", "5"]]), simulationProperties: { a: 6 } }),
        mockSquad()
      )
    ).toBe(29.700000000000003);
  });
});
