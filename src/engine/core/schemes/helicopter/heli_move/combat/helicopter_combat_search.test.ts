import { describe, expect, it, jest } from "@jest/globals";

import {
  initializeHelicopterCombatSearch,
  setupHelicopterCombatSearchFlight,
  updateHelicopterCombatSearch,
  updateHelicopterCombatSearchFlight,
  updateHelicopterCombatSearchShooting,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_search";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { copyVector } from "@/engine/core/utils/vector";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("initializeHelicopterCombatSearch", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(4, 3, 4);

    manager.searchVelocity = 155;
    manager.safeAltitude = 360;
    manager.searchAttackDist = 3;
    manager.flightDirection = true;
    manager.speedIs0 = false;

    jest.spyOn(Date, "now").mockImplementation(() => 1000);

    initializeHelicopterCombatSearch(manager);

    expect(manager.changeSpeedAt).toBeLessThanOrEqual(8000);
    expect(manager.changeSpeedAt).toBeGreaterThanOrEqual(6000);
    expect(manager.isSearchInitialized).toBe(true);
    expect(manager.speedIs0).toBe(true);
    expect(manager.changePosAt).toBe(0);
    expect(manager.centerPos).toEqual(MockVector.mock(4, 360, 4));
    expect(manager.enemyLastSeenPos).toEqual(MockVector.mock(4, 360, 4));
    expect(typeof manager.flightDirection).toBe("boolean");
    expect(manager.changeCombatTypeAllowed).toBe(true);
    expect(manager.searchBeginShootAt).toBe(0);

    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledWith(false);
    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(0);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(0);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledWith(manager.centerPos, 3, expect.any(Boolean));
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledWith(enemy.position(), true);
  });
});

describe("setupHelicopterCombatSearchFlight", () => {
  it("should correctly setup", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = copyVector(enemy.position());
    manager.safeAltitude = 355;
    manager.flightDirection = true;

    setupHelicopterCombatSearchFlight(manager);

    expect(manager.centerPos).toEqual(MockVector.mock(0.25, 355, 0.25));
    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(5);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(5);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledWith(MockVector.mock(0.25, 355, 0.25), 100, true);
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledWith(MockVector.mock(0.25, 0.25, 0.25), true);
  });
});

describe("updateHelicopterCombatSearchShooting", () => {
  it("should correctly update when enemy is not visible", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.searchBeginShootAt = 1;

    updateHelicopterCombatSearchShooting(manager, false);

    expect(manager.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(manager.searchBeginShootAt).toBeNull();
  });

  it("should correctly update when enemy is visible", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;

    jest.spyOn(Date, "now").mockImplementation(() => 2500);

    updateHelicopterCombatSearchShooting(manager, true);

    expect(manager.searchBeginShootAt).toBe(4500);

    jest.spyOn(Date, "now").mockImplementation(() => 4600);

    updateHelicopterCombatSearchShooting(manager, true);

    expect(manager.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(manager.searchBeginShootAt).toBe(4500);
  });
});

describe("updateHelicopterCombatSearchFlight", () => {
  it("should correctly update when should change speed", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(1, 2, 3);
    manager.speedIs0 = true;
    manager.changeSpeedAt = 0;
    manager.safeAltitude = 500;
    manager.searchVelocity = 300;

    jest.spyOn(Date, "now").mockImplementation(() => 6000);

    updateHelicopterCombatSearchFlight(manager);

    expect(manager.speedIs0).toBe(false);
    expect(manager.changeSpeedAt).toBeGreaterThanOrEqual(14_000);
    expect(manager.changeSpeedAt).toBeLessThanOrEqual(18_000);

    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
  });

  it("should correctly update when should change position", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(1, 2, 3);
    manager.centerPos = MockVector.mock(10, 20, 30);
    manager.changeSpeedAt = 1_000_000;
    manager.changePosAt = 0;
    manager.canForgetEnemy = false;

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    updateHelicopterCombatSearchFlight(manager);

    expect(manager.changePosAt).toBe(12_000);
    expect(manager.canForgetEnemy).toBe(true);

    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
  });
});

describe("updateHelicopterCombatSearch", () => {
  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    jest.spyOn(Date, "now").mockImplementation(() => 0);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(1, 2, 3);

    updateHelicopterCombatSearch(manager, true);

    expect(manager.isSearchInitialized).toBe(true);
  });
});
