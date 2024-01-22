import { describe, expect, it } from "@jest/globals";

import { EHelicopterFlyByState } from "@/engine/core/schemes/helicopter/heli_move";
import {
  initializeHelicopterCombatFlyBy,
  updateHelicopterCombatFlyby,
  updateHelicopterCombatFlyByFlight,
} from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_fly_by";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("initializeHelicopterCombatFlyBy", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    manager.flybyAttackDist = 10;
    manager.maxVelocity = 455;

    initializeHelicopterCombatFlyBy(manager);

    expect(manager.flyByState).toBe(EHelicopterFlyByState.TO_ATTACK_DIST);
    expect(manager.isFlybyInitialized).toBe(true);
    expect(manager.isStateInitialized).toBe(false);
    expect(manager.wasCallback).toBe(false);
    expect(manager.flybyStatesForOnePass).toBe(2);

    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(455);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(455);
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledWith(ZERO_VECTOR, false);
  });
});

describe("updateHelicopterCombatFlyByFlight", () => {
  it("should correctly update with to attack dist state", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.isStateInitialized = true;
    manager.wasCallback = true;
    manager.enemy = enemy;
    manager.flyByState = EHelicopterFlyByState.TO_ATTACK_DIST;
    manager.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    manager.safeAltitude = 600;

    manager.flybyStatesForOnePass = 10;
    manager.searchAttackDist = 5;

    updateHelicopterCombatFlyByFlight(manager);

    expect(manager.flyByState).toBe(EHelicopterFlyByState.TO_ENEMY);
    expect(manager.wasCallback).toBe(false);
    expect(manager.isStateInitialized).toBe(true);

    expect(manager.helicopter.SetEnemy).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledWith(true);
    expect(manager.helicopter.SetDestPosition).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetDestPosition).toHaveBeenCalledWith(MockVector.mock(1, 600, 1));
    expect(manager.changeCombatTypeAllowed).toBe(false);
  });

  it("should correctly update with to enemy state", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.isStateInitialized = true;
    manager.wasCallback = true;
    manager.flyByState = EHelicopterFlyByState.TO_ENEMY;
    manager.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    manager.safeAltitude = 300;

    updateHelicopterCombatFlyByFlight(manager);

    expect(manager.flyByState).toBe(EHelicopterFlyByState.TO_ATTACK_DIST);
    expect(manager.wasCallback).toBe(false);
    expect(manager.isStateInitialized).toBe(true);

    expect(manager.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetDestPosition).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetDestPosition).toHaveBeenCalledWith(
      MockVector.create(71.71067811865476, 300, 71.71067811865476)
    );
    expect(manager.changeCombatTypeAllowed).toBe(false);
    expect(manager.isStateInitialized).toBe(true);
  });
});

describe("updateHelicopterCombatFlyby", () => {
  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.isStateInitialized = true;
    manager.wasCallback = true;
    manager.flyByState = EHelicopterFlyByState.TO_ENEMY;
    manager.enemyLastSeenPos = MockVector.mock(1, 1, 1);
    manager.safeAltitude = 300;

    updateHelicopterCombatFlyby(manager);

    expect(manager.isFlybyInitialized).toBe(true);
    expect(manager.isStateInitialized).toBe(true);
  });
});
