import { describe, expect, it, jest } from "@jest/globals";

import {
  initializeHelicopterCombatRound,
  roundSetupFlight,
  updateHelicopterCombatRoundShooting,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_round";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("initializeHelicopterCombatRound", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(1, 0, 1);
    manager.roundVelocity = 45;

    initializeHelicopterCombatRound(manager);

    expect(manager.isRoundInitialized).toBe(true);
    expect(manager.changeDirTime).toBe(0);
    expect(manager.changePosTime).toBe(0);
    expect(manager.centerPos).toBe(manager.enemyLastSeenPos);
    expect(typeof manager.flightDirection).toBe("boolean");
    expect(manager.changeCombatTypeAllowed).toBe(true);
    expect(manager.roundBeginShootTime).toBe(0);

    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(45);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(45);
    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledWith(false);

    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
  });
});

describe("roundSetupFlight", () => {
  it("should correctly setup", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.safeAltitude = 400;
    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(1, 0, 1);

    roundSetupFlight(manager, true);

    expect(manager.centerPos).toEqual(MockVector.mock(1, 400, 1));

    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledWith(MockVector.mock(0.25, 0.25, 0.25), true);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledWith(MockVector.mock(1, 400, 1), 100, true);
  });
});

describe("updateHelicopterCombatRoundShooting", () => {
  it("should correctly update when enemy seen", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;

    jest.spyOn(Date, "now").mockImplementation(() => 4000);

    updateHelicopterCombatRoundShooting(manager, true);

    expect(manager.helicopter.SetEnemy).toHaveBeenCalledTimes(0);
    expect(manager.roundBeginShootTime).toBe(6000);

    jest.spyOn(Date, "now").mockImplementation(() => 6001);

    updateHelicopterCombatRoundShooting(manager, true);

    expect(manager.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(manager.roundBeginShootTime).toBe(6000);
  });

  it("should correctly update when enemy not seen", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    manager.roundBeginShootTime = 1;

    updateHelicopterCombatRoundShooting(manager, false);

    expect(manager.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(manager.roundBeginShootTime).toBeNull();
  });
});
