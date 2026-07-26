import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";

import {
  initializeHelicopterCombatRound,
  roundSetupFlight,
  updateHelicopterCombatRound,
  updateHelicopterCombatRoundFlight,
  updateHelicopterCombatRoundShooting,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_round";
import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

describe("initializeHelicopterCombatRound", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 0, 1);
    controller.roundVelocity = 45;

    initializeHelicopterCombatRound(controller);

    expect(controller.isRoundInitialized).toBe(true);
    expect(controller.changeDirAt).toBe(0);
    expect(controller.changePosAt).toBe(0);
    expect(controller.centerPos).toBe(controller.enemyLastSeenPos);
    expect(typeof controller.flightDirection).toBe("boolean");
    expect(controller.changeCombatTypeAllowed).toBe(true);
    expect(controller.roundBeginShootTime).toBe(0);

    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledWith(45);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(45);
    expect(controller.helicopter.UseFireTrail).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.UseFireTrail).toHaveBeenCalledWith(false);

    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
  });
});

describe("roundSetupFlight", () => {
  it("should correctly setup", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.safeAltitude = 400;
    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 0, 1);

    roundSetupFlight(controller, true);

    expect(controller.centerPos).toEqual(MockVector.mock(1, 400, 1));

    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledWith(MockVector.mock(0.25, 0.25, 0.25), true);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledWith(MockVector.mock(1, 400, 1), 100, true);
  });
});

describe("updateHelicopterCombatRoundShooting", () => {
  it("should correctly update when enemy seen", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;

    jest.spyOn(Date, "now").mockImplementation(() => 4000);

    updateHelicopterCombatRoundShooting(controller, true);

    expect(controller.helicopter.SetEnemy).toHaveBeenCalledTimes(0);
    expect(controller.roundBeginShootTime).toBe(6000);

    jest.spyOn(Date, "now").mockImplementation(() => 6001);

    updateHelicopterCombatRoundShooting(controller, true);

    expect(controller.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(controller.roundBeginShootTime).toBe(6000);
  });

  it("should correctly update when enemy not seen", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    controller.roundBeginShootTime = 1;

    updateHelicopterCombatRoundShooting(controller, false);

    expect(controller.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(controller.roundBeginShootTime).toBeNull();
  });
});

describe("updateHelicopterCombatRoundFlight", () => {
  it("should correctly update ", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.safeAltitude = 400;
    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 0, 1);
    controller.searchAttackDist = 20;
    controller.centerPos = MockVector.mock(20, 10, 20);

    jest.spyOn(Date, "now").mockImplementation(() => 4000);
    jest.spyOn(controller.centerPos, "distance_to_sqr").mockImplementation(() => 4000);

    controller.changePosAt = 0;

    updateHelicopterCombatRoundFlight(controller);

    expect(controller.canForgetEnemy).toBe(true);
    expect(controller.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
  });
});

describe("updateHelicopterCombatRound", () => {
  it("should correctly update ", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemy = enemy;
    controller.enemyLastSeenPos = MockVector.mock(1, 0, 1);

    jest.spyOn(Date, "now").mockImplementation(() => 1000);

    updateHelicopterCombatRound(controller, true);

    expect(controller.isRoundInitialized).toBe(true);
    expect(controller.roundBeginShootTime).toBe(3000);
  });
});
