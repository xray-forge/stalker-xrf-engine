import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";

import { EHelicopterFlyByState } from "@/engine/core/schemes/helicopter/heli_move";
import {
  initializeHelicopterCombatFlyBy,
  updateHelicopterCombatFlyby,
  updateHelicopterCombatFlyByFlight,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_fly_by";
import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

describe("initializeHelicopterCombatFlyBy", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    controller.flybyAttackDist = 10;
    controller.maxVelocity = 455;

    initializeHelicopterCombatFlyBy(controller);

    expect(controller.flyByState).toBe(EHelicopterFlyByState.TO_ATTACK_DIST);
    expect(controller.isFlybyInitialized).toBe(true);
    expect(controller.isStateInitialized).toBe(false);
    expect(controller.wasCallback).toBe(false);
    expect(controller.flybyStatesForOnePass).toBe(2);

    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledWith(455);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(455);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledWith(ZERO_VECTOR, false);
  });
});

describe("updateHelicopterCombatFlyByFlight", () => {
  it("should correctly update with to attack dist state", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.isStateInitialized = true;
    controller.wasCallback = true;
    controller.enemy = enemy;
    controller.flyByState = EHelicopterFlyByState.TO_ATTACK_DIST;
    controller.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    controller.safeAltitude = 600;

    controller.flybyStatesForOnePass = 10;
    controller.searchAttackDist = 5;

    updateHelicopterCombatFlyByFlight(controller);

    expect(controller.flyByState).toBe(EHelicopterFlyByState.TO_ENEMY);
    expect(controller.wasCallback).toBe(false);
    expect(controller.isStateInitialized).toBe(true);

    expect(controller.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(controller.helicopter.UseFireTrail).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.UseFireTrail).toHaveBeenCalledWith(true);
    expect(controller.helicopter.SetDestPosition).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetDestPosition).toHaveBeenCalledWith(MockVector.mock(1, 600, 1));
    expect(controller.changeCombatTypeAllowed).toBe(false);
  });

  it("should correctly update with to enemy state", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.isStateInitialized = true;
    controller.wasCallback = true;
    controller.flyByState = EHelicopterFlyByState.TO_ENEMY;
    controller.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    controller.safeAltitude = 300;

    updateHelicopterCombatFlyByFlight(controller);

    expect(controller.flyByState).toBe(EHelicopterFlyByState.TO_ATTACK_DIST);
    expect(controller.wasCallback).toBe(false);
    expect(controller.isStateInitialized).toBe(true);

    expect(controller.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetDestPosition).toHaveBeenCalledTimes(1);
    expect(controller.helicopter.SetDestPosition).toHaveBeenCalledWith(
      MockVector.create(71.71067811865476, 300, 71.71067811865476)
    );
    expect(controller.changeCombatTypeAllowed).toBe(false);
    expect(controller.isStateInitialized).toBe(true);
  });
});

describe("updateHelicopterCombatFlyby", () => {
  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.isStateInitialized = true;
    controller.wasCallback = true;
    controller.flyByState = EHelicopterFlyByState.TO_ENEMY;
    controller.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    controller.safeAltitude = 300;

    updateHelicopterCombatFlyby(controller);

    expect(controller.isFlybyInitialized).toBe(true);
    expect(controller.isStateInitialized).toBe(true);
  });
});
