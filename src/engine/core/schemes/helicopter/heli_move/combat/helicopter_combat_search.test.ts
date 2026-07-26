import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { copyVector } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";

import {
  initializeHelicopterCombatSearch,
  setupHelicopterCombatSearchFlight,
  updateHelicopterCombatSearch,
  updateHelicopterCombatSearchFlight,
  updateHelicopterCombatSearchShooting,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_search";
import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

describe("initializeHelicopterCombatSearch", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(4, 3, 4);

    controller.searchVelocity = 155;
    controller.safeAltitude = 360;
    controller.searchAttackDist = 3;
    controller.flightDirection = true;
    controller.speedIs0 = false;

    jest.spyOn(Date, "now").mockImplementation(() => 1000);

    initializeHelicopterCombatSearch(controller);

    expect(controller.changeSpeedAt).toBeLessThanOrEqual(8000);
    expect(controller.changeSpeedAt).toBeGreaterThanOrEqual(6000);
    expect(controller.isSearchInitialized).toBe(true);
    expect(controller.speedIs0).toBe(true);
    expect(controller.changePosAt).toBe(0);
    expect(controller.centerPos).toEqual(MockVector.mock(4, 360, 4));
    expect(controller.enemyLastSeenPos).toEqual(MockVector.mock(4, 360, 4));
    expect(typeof controller.flightDirection).toBe("boolean");
    expect(controller.changeCombatTypeAllowed).toBe(true);
    expect(controller.searchBeginShootAt).toBe(0);

    expect(controller.helicopter.UseFireTrail).toHaveBeenCalledWith(false);
    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledWith(0);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(0);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledWith(
      controller.centerPos,
      3,
      expect.any(Boolean)
    );
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledWith(enemy.position(), true);
  });
});

describe("setupHelicopterCombatSearchFlight", () => {
  it("should correctly setup", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = copyVector(enemy.position());
    controller.safeAltitude = 355;
    controller.flightDirection = true;

    setupHelicopterCombatSearchFlight(controller);

    expect(controller.centerPos).toEqual(MockVector.mock(0.25, 355, 0.25));
    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledWith(5);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(5);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledWith(MockVector.mock(0.25, 355, 0.25), 100, true);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledWith(MockVector.mock(0.25, 0.25, 0.25), true);
  });
});

describe("updateHelicopterCombatSearchShooting", () => {
  it("should correctly update when enemy is not visible", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.searchBeginShootAt = 1;

    updateHelicopterCombatSearchShooting(controller, false);

    expect(controller.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(controller.searchBeginShootAt).toBeNull();
  });

  it("should correctly update when enemy is visible", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;

    jest.spyOn(Date, "now").mockImplementation(() => 2500);

    updateHelicopterCombatSearchShooting(controller, true);

    expect(controller.searchBeginShootAt).toBe(4500);

    jest.spyOn(Date, "now").mockImplementation(() => 4600);

    updateHelicopterCombatSearchShooting(controller, true);

    expect(controller.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(controller.searchBeginShootAt).toBe(4500);
  });
});

describe("updateHelicopterCombatSearchFlight", () => {
  it("should correctly update when should change speed", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 2, 3);
    controller.speedIs0 = true;
    controller.changeSpeedAt = 0;
    controller.safeAltitude = 500;
    controller.searchVelocity = 300;

    jest.spyOn(Date, "now").mockImplementation(() => 6000);

    updateHelicopterCombatSearchFlight(controller);

    expect(controller.speedIs0).toBe(false);
    expect(controller.changeSpeedAt).toBeGreaterThanOrEqual(14_000);
    expect(controller.changeSpeedAt).toBeLessThanOrEqual(18_000);

    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
  });

  it("should correctly update when should change position", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 2, 3);
    controller.centerPos = MockVector.mock(10, 20, 30);
    controller.changeSpeedAt = 1_000_000;
    controller.changePosAt = 0;
    controller.canForgetEnemy = false;

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    updateHelicopterCombatSearchFlight(controller);

    expect(controller.changePosAt).toBe(12_000);
    expect(controller.canForgetEnemy).toBe(true);

    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
  });
});

describe("updateHelicopterCombatSearch", () => {
  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    jest.spyOn(Date, "now").mockImplementation(() => 0);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 2, 3);

    updateHelicopterCombatSearch(controller, true);

    expect(controller.isSearchInitialized).toBe(true);
  });
});
