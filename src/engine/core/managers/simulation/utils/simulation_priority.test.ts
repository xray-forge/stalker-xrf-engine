import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TName, TRate } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { MockAlifeObject, MockVector } from "xray16/mocks";

import { registerSimulator, registry } from "@/engine/core/database";
import {
  evaluateSimulationPriority,
  evaluateSimulationPriorityByDistance,
  getSlicedSimulationTargets,
  getSquadSimulationTarget,
} from "@/engine/core/managers/simulation/utils/simulation_priority";
import { Squad } from "@/engine/core/objects/squad";
import { resetPositionCache } from "@/engine/core/utils/position";
import { MockSquad, resetRegistry } from "@/fixtures/engine";

describe("evaluateSimulationPriorityByDistance", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly evaluate priority by distance", () => {
    resetPositionCache();
    MockVector.DEFAULT_DISTANCE = 20;
    expect(evaluateSimulationPriorityByDistance(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(1.05);

    resetPositionCache();
    MockVector.DEFAULT_DISTANCE = 10;
    expect(evaluateSimulationPriorityByDistance(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(1.1);

    resetPositionCache();
    MockVector.DEFAULT_DISTANCE = 5;
    expect(evaluateSimulationPriorityByDistance(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(1.2);
  });
});

describe("evaluateSimulationPriority", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly evaluate priority", () => {
    resetPositionCache();
    MockVector.DEFAULT_DISTANCE = 20;

    const first: Squad = MockSquad.mock();
    const second: Squad = MockSquad.mock();
    const third: Squad = MockSquad.mock({
      behaviour: $fromObject<string, string>({ a: "5" }),
      simulationProperties: $fromObject<TName, TRate>({ a: 6 }),
    });
    const fourth: Squad = MockSquad.mock();

    jest.spyOn(first, "isValidSimulationTarget").mockImplementation(() => true);
    jest.spyOn(third, "isValidSimulationTarget").mockImplementation(() => true);

    expect(evaluateSimulationPriority(first, second)).toBe(13.65);

    resetPositionCache();
    MockVector.DEFAULT_DISTANCE = 10;

    expect(evaluateSimulationPriority(third, fourth)).toBe(29.700000000000003);
  });
});

function mockSimulationTargetSquad(propertyRate: TRate): Squad {
  const target: Squad = MockSquad.mock({
    simulationProperties: $fromObject<TName, TRate>({ a: propertyRate }),
  });

  jest.spyOn(target, "isValidSimulationTarget").mockImplementation(() => true);
  registry.simulationObjects.set(target.id, target);

  return target;
}

describe("getSlicedSimulationTargets", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    resetPositionCache();

    MockVector.DEFAULT_DISTANCE = 20;
  });

  it("should rotate slice slots and keep last-written survivors sorted by priority", () => {
    const squad: Squad = MockSquad.mock({ behaviour: $fromObject<string, string>({ a: "1" }) });

    registry.simulationObjects.set(squad.id, squad);

    const targets: Array<Squad> = [10, 20, 30, 40, 50, 60, 70].map((rate) => mockSimulationTargetSquad(rate));
    const result = getSlicedSimulationTargets(squad, 5);

    // Rotation: targets 6 and 7 overwrite slots 1 and 2, self squad is excluded.
    expect(result.length()).toBe(5);
    expect(result.get(1).priority).toBeCloseTo(76.65);
    expect(result.get(1).target).toBe(targets[6]);
    expect(result.get(2).priority).toBeCloseTo(66.15);
    expect(result.get(2).target).toBe(targets[5]);
    expect(result.get(3).priority).toBeCloseTo(55.65);
    expect(result.get(4).priority).toBeCloseTo(45.15);
    expect(result.get(5).priority).toBeCloseTo(34.65);
  });

  it("should overwrite slots on rotation even when the newcomer has lower priority", () => {
    const squad: Squad = MockSquad.mock({ behaviour: $fromObject<string, string>({ a: "1" }) });
    const targets: Array<Squad> = [10, 20, 30, 40, 50].map((rate) => mockSimulationTargetSquad(rate));
    const weakest: Squad = mockSimulationTargetSquad(1);
    const result = getSlicedSimulationTargets(squad, 5);

    // Sixth target wraps to slot 1 and replaces the previous record regardless of priority.
    expect(result.length()).toBe(5);
    expect(result.get(5).priority).toBeCloseTo(4.2);
    expect(result.get(5).target).toBe(weakest);
    expect(result.get(1).target).toBe(targets[4]);
  });
});

describe("getSquadSimulationTarget", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    resetPositionCache();

    MockVector.DEFAULT_DISTANCE = 20;
  });

  it("should pick a random entry among sliced targets", () => {
    const squad: Squad = MockSquad.mock({ behaviour: $fromObject<string, string>({ a: "1" }) });
    const target: Squad = mockSimulationTargetSquad(10);
    const randomSpy = jest.spyOn(math, "random");

    randomSpy.mockReturnValueOnce(1);

    expect(getSquadSimulationTarget(squad)).toBe(target);

    randomSpy.mockRestore();
  });

  it("should fall back to self when no targets are available", () => {
    const squad: Squad = MockSquad.mock();

    expect(getSquadSimulationTarget(squad)).toBe(squad);
  });
});
