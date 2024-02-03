import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import {
  evaluateSimulationPriority,
  evaluateSimulationPriorityByDistance,
} from "@/engine/core/managers/simulation/utils/simulation_priority";
import { Squad } from "@/engine/core/objects/squad";
import { TName, TRate } from "@/engine/lib/types";
import { MockSquad } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { MockAlifeObject, MockVector } from "@/fixtures/xray";

describe("evaluateSimulationPriorityByDistance util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly evaluate priority by distance", () => {
    MockVector.DEFAULT_DISTANCE = 20;
    expect(evaluateSimulationPriorityByDistance(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(1.05);

    MockVector.DEFAULT_DISTANCE = 10;
    expect(evaluateSimulationPriorityByDistance(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(1.1);

    MockVector.DEFAULT_DISTANCE = 5;
    expect(evaluateSimulationPriorityByDistance(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(1.2);
  });
});

describe("evaluateSimulationPriority util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly evaluate priority", () => {
    MockVector.DEFAULT_DISTANCE = 20;

    const first: Squad = MockSquad.mock();
    const second: Squad = MockSquad.mock();
    const third: Squad = MockSquad.mock({
      behaviour: MockLuaTable.mock([["a", "5"]]),
      simulationProperties: $fromObject<TName, TRate>({ a: 6 }),
    });
    const fourth: Squad = MockSquad.mock();

    jest.spyOn(first, "isValidSimulationTarget").mockImplementation(() => true);
    jest.spyOn(third, "isValidSimulationTarget").mockImplementation(() => true);

    expect(evaluateSimulationPriority(first, second)).toBe(13.65);

    MockVector.DEFAULT_DISTANCE = 10;

    expect(evaluateSimulationPriority(third, fourth)).toBe(29.700000000000003);
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
