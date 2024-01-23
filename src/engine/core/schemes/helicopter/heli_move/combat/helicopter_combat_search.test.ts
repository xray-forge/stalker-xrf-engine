import { describe, expect, it, jest } from "@jest/globals";

import {
  setupHelicopterCombatSearchFlight,
  updateHelicopterCombatSearchShooting,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_search";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { copyVector } from "@/engine/core/utils/vector";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("initializeHelicopterCombatSearch", () => {
  it.todo("should correctly initialize");
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
