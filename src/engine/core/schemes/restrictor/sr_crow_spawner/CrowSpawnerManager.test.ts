jest.mock("@/engine/core/utils/scheme/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { registerActor, registerSimulator, registry } from "@/engine/core/database";
import { CrowSpawnerManager } from "@/engine/core/schemes/restrictor/sr_crow_spawner/CrowSpawnerManager";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/restrictor/sr_crow_spawner/ISchemeCrowSpawnerState";
import { range } from "@/engine/core/utils/number";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { AlifeSimulator, ClientObject, EScheme, Patrol } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockActorClientGameObject, mockClientGameObject } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("CrowSpawnerManager class", () => {
  beforeEach(() => registerSimulator());

  it("should correctly initialize", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeCrowSpawnerState = mockSchemeState(EScheme.SR_CROW_SPAWNER);
    const manager: CrowSpawnerManager = new CrowSpawnerManager(object, state);

    expect(manager.nextUpdateAt).toBe(0);
    expect(manager.spawnPointsUpdateAt).toEqualLuaTables({});
  });

  it("should correctly handle updates", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeCrowSpawnerState = mockSchemeState(EScheme.SR_CROW_SPAWNER);
    const manager: CrowSpawnerManager = new CrowSpawnerManager(object, state);

    jest.spyOn(Date, "now").mockImplementation(() => 5500);
    jest.spyOn(manager, "spawnCrows").mockImplementation(jest.fn());

    state.maxCrowsOnLevel = 10;
    manager.nextUpdateAt = Infinity;
    manager.update();
    expect(manager.spawnCrows).not.toHaveBeenCalled();
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);

    state.maxCrowsOnLevel = 0;
    manager.nextUpdateAt = 0;
    manager.update();
    expect(manager.nextUpdateAt).toBe(125_500);
    expect(manager.spawnCrows).not.toHaveBeenCalled();
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(2);

    state.maxCrowsOnLevel = 10;
    manager.nextUpdateAt = 0;
    manager.update();
    expect(manager.spawnCrows).toHaveBeenCalled();
    expect(manager.nextUpdateAt).toBe(0);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(3);
  });

  it("should correctly handle crow spawn", () => {
    const simulator: AlifeSimulator = registry.simulator;
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeCrowSpawnerState = mockSchemeState(EScheme.SR_CROW_SPAWNER);
    const manager: CrowSpawnerManager = new CrowSpawnerManager(object, state);

    registerActor(mockActorClientGameObject());

    jest.spyOn(Date, "now").mockImplementation(() => 5500);

    state.maxCrowsOnLevel = 10;
    state.pathsList = $fromArray(["test_smart_guard_1_walk", "test_smart_patrol_1_walk"]);

    for (const [, name] of state.pathsList) {
      const crowPatrol: Patrol = new patrol(name);

      jest.spyOn(crowPatrol.point(0), "distance_to_sqr").mockImplementation(() => Infinity);
    }

    manager.spawnCrows();
    manager.spawnCrows();

    // After two iterations time is set.
    expect(manager.spawnPointsUpdateAt).toEqualLuaTables({
      test_smart_guard_1_walk: 15_500,
      test_smart_patrol_1_walk: 15_500,
    });
    expect(simulator.create).toHaveBeenCalledTimes(2);

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    manager.spawnCrows();
    manager.spawnCrows();

    // No updates.
    expect(manager.spawnPointsUpdateAt).toEqualLuaTables({
      test_smart_guard_1_walk: 15_500,
      test_smart_patrol_1_walk: 15_500,
    });
    expect(simulator.create).toHaveBeenCalledTimes(2);

    jest.spyOn(Date, "now").mockImplementation(() => 50_000);

    manager.spawnCrows();
    manager.spawnCrows();

    // Updated on timeout.
    expect(manager.spawnPointsUpdateAt).toEqualLuaTables({
      test_smart_guard_1_walk: 60_000,
      test_smart_patrol_1_walk: 60_000,
    });
    expect(simulator.create).toHaveBeenCalledTimes(4);

    range(4).forEach((it) => {
      expect(simulator.create).toHaveBeenNthCalledWith(
        it + 1,
        "m_crow",
        expect.any(MockVector),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});
