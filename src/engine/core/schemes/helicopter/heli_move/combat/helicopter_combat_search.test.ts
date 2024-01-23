import { describe, expect, it, jest } from "@jest/globals";

import {
  initializeHelicopterCombatSearch,
  setupHelicopterCombatSearchFlight,
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

    expect(manager.changeSpeedTime).toBeLessThanOrEqual(8000);
    expect(manager.changeSpeedTime).toBeGreaterThanOrEqual(6000);
    expect(manager.isSearchInitialized).toBe(true);
    expect(manager.speedIs0).toBe(true);
    expect(manager.changePosTime).toBe(0);
    expect(manager.centerPos).toEqual(MockVector.mock(4, 360, 4));
    expect(manager.enemyLastSeenPos).toEqual(MockVector.mock(4, 360, 4));
    expect(typeof manager.flightDirection).toBe("boolean");
    expect(manager.changeCombatTypeAllowed).toBe(true);
    expect(manager.searchBeginShootTime).toBe(0);

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

    manager.searchBeginShootTime = 1;

    updateHelicopterCombatSearchShooting(manager, false);

    expect(manager.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(manager.searchBeginShootTime).toBeNull();
  });

  it("should correctly update when enemy is visible", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;

    jest.spyOn(Date, "now").mockImplementation(() => 2500);

    updateHelicopterCombatSearchShooting(manager, true);

    expect(manager.searchBeginShootTime).toBe(4500);

    jest.spyOn(Date, "now").mockImplementation(() => 4600);

    updateHelicopterCombatSearchShooting(manager, true);

    expect(manager.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(manager.searchBeginShootTime).toBe(4500);
  });
});

describe("updateHelicopterCombatSearchFlight", () => {
  it.todo("should correctly update");
});

describe("updateHelicopterCombatSearch", () => {
  it.todo("should correctly update");
});
