import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import {
  evaluateSimulationPriority,
  evaluateSimulationPriorityByDistance,
} from "@/engine/core/managers/simulation/utils/simulation_priority";
import { TName, TRate } from "@/engine/lib/types";
import { mockSquad } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { mockServerAlifeObject, MockVector } from "@/fixtures/xray";

describe("evaluateSimulationPriorityByDistance util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly evaluate priority by distance", () => {
    MockVector.DEFAULT_DISTANCE = 20;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.05);

    MockVector.DEFAULT_DISTANCE = 10;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.1);

    MockVector.DEFAULT_DISTANCE = 5;
    expect(evaluateSimulationPriorityByDistance(mockServerAlifeObject(), mockServerAlifeObject())).toBe(1.2);
  });
});

describe("evaluateSimulationPriority util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly evaluate priority", () => {
    MockVector.DEFAULT_DISTANCE = 20;

    expect(evaluateSimulationPriority(mockSquad(), mockSquad())).toBe(13.65);

    MockVector.DEFAULT_DISTANCE = 10;

    expect(
      evaluateSimulationPriority(
        mockSquad({
          behaviour: MockLuaTable.mock([["a", "5"]]),
          simulationProperties: $fromObject<TName, TRate>({ a: 6 }),
        }),
        mockSquad()
      )
    ).toBe(29.700000000000003);
  });
});

describe("getAvailableSimulationTargets util", () => {
  it.todo("should correctly get list of sorted targets");
});

describe("getSlicedSimulationTargets util", () => {
  it.todo("should correctly get limited list of sorted targets");
});

describe("getSquadSimulationTarget util", () => {
  it.todo("should correctly get random highest priority target for simulation");
});
