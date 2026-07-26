import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { AlifeSimulator, GameObject, Patrol } from "xray16/alias";
import { range } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject, MockVector } from "xray16/mocks";

import { registerActor, registerSimulator, registry } from "@/engine/core/database";
import { CrowSpawnerController } from "@/engine/core/schemes/restrictor/sr_crow_spawner/CrowSpawnerController";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/restrictor/sr_crow_spawner/sr_crow_spawner_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("CrowSpawnerController", () => {
  beforeEach(() => registerSimulator());

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCrowSpawnerState = mockSchemeState(EScheme.SR_CROW_SPAWNER);
    const controller: CrowSpawnerController = new CrowSpawnerController(object, state);

    expect(controller.nextUpdateAt).toBe(0);
    expect(controller.spawnPointsUpdateAt).toEqualLuaTables({});
  });

  it("should correctly handle updates", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCrowSpawnerState = mockSchemeState(EScheme.SR_CROW_SPAWNER);
    const controller: CrowSpawnerController = new CrowSpawnerController(object, state);

    jest.spyOn(Date, "now").mockImplementation(() => 5500);
    jest.spyOn(controller, "spawnCrows").mockImplementation(jest.fn());

    state.maxCrowsOnLevel = 10;
    controller.nextUpdateAt = Infinity;
    controller.update();
    expect(controller.spawnCrows).not.toHaveBeenCalled();
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);

    state.maxCrowsOnLevel = 0;
    controller.nextUpdateAt = 0;
    controller.update();
    expect(controller.nextUpdateAt).toBe(125_500);
    expect(controller.spawnCrows).not.toHaveBeenCalled();
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(2);

    state.maxCrowsOnLevel = 10;
    controller.nextUpdateAt = 0;
    controller.update();
    expect(controller.spawnCrows).toHaveBeenCalled();
    expect(controller.nextUpdateAt).toBe(0);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(3);
  });

  it("should correctly handle crow spawn", () => {
    const simulator: AlifeSimulator = registry.simulator;
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCrowSpawnerState = mockSchemeState(EScheme.SR_CROW_SPAWNER);
    const controller: CrowSpawnerController = new CrowSpawnerController(object, state);

    registerActor(MockGameObject.mockActor());

    jest.spyOn(Date, "now").mockImplementation(() => 5500);

    state.maxCrowsOnLevel = 10;
    state.pathsList = $fromArray(["test_smart_guard_1_walk", "test_smart_patrol_1_walk"]);

    for (const [, name] of state.pathsList) {
      const crowPatrol: Patrol = new patrol(name);

      jest.spyOn(crowPatrol.point(0), "distance_to_sqr").mockImplementation(() => Infinity);
    }

    controller.spawnCrows();
    controller.spawnCrows();

    // After two iterations time is set.
    expect(controller.spawnPointsUpdateAt).toEqualLuaTables({
      test_smart_guard_1_walk: 15_500,
      test_smart_patrol_1_walk: 15_500,
    });
    expect(simulator.create).toHaveBeenCalledTimes(2);

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    controller.spawnCrows();
    controller.spawnCrows();

    // No updates.
    expect(controller.spawnPointsUpdateAt).toEqualLuaTables({
      test_smart_guard_1_walk: 15_500,
      test_smart_patrol_1_walk: 15_500,
    });
    expect(simulator.create).toHaveBeenCalledTimes(2);

    jest.spyOn(Date, "now").mockImplementation(() => 50_000);

    controller.spawnCrows();
    controller.spawnCrows();

    // Updated on timeout.
    expect(controller.spawnPointsUpdateAt).toEqualLuaTables({
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
