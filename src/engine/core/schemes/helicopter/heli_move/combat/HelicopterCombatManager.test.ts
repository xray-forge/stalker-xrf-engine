import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level, time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockNetProcessor, MockVector } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { registerObject } from "@/engine/core/database";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { EHelicopterCombatType } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { resetRegistry } from "@/fixtures/engine";

interface ICombatFixture {
  enemy: GameObject;
  manager: HelicopterCombatManager;
  object: GameObject;
}

function createCombatFixture(): ICombatFixture {
  const object: GameObject = MockGameObject.mockHelicopter();
  const enemy: GameObject = MockGameObject.mock({ id: 100 });

  registerObject(object);

  const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

  manager.enemy = enemy;
  manager.enemyId = enemy.id();
  manager.enemyLastSeenPos = MockVector.mock(1, 2, 3);
  manager.enemyLastSeenTime = 0;

  return { enemy, manager, object };
}

describe("HelicopterCombatManager", () => {
  beforeEach(() => {
    resetRegistry();
    replaceFunctionMock(time_global, () => 1_000);
  });

  it("should correctly initialize", () => {
    const { enemy, manager, object } = createCombatFixture();

    manager.initialize();

    expect(manager.isInitialized).toBe(true);
    expect(manager.combatType).toBe(EHelicopterCombatType.FLY_BY);
    expect(manager.enemyLastSeenPos).toEqual(enemy.position());
    expect(manager.canForgetEnemy).toBe(false);
    expect(manager.isSectionChanged).toBe(true);
    expect(manager.helicopter.m_max_mgun_dist).toBe(manager.mMaxMGunDist);
    expect(object.set_fastcall).toHaveBeenCalledWith(manager.fastcall, manager);
  });

  it("should correctly save and load fly-by combat state", () => {
    const { manager, object } = createCombatFixture();
    const packet: MockNetProcessor = new MockNetProcessor();

    manager.isInitialized = true;
    manager.canForgetEnemy = true;
    manager.enemyForgetable = false;
    manager.combatType = EHelicopterCombatType.FLY_BY;
    manager.flybyStatesForOnePass = 1;

    manager.save(packet.asNetPacket());

    const restored: HelicopterCombatManager = new HelicopterCombatManager(object);

    restored.load(packet.asNetReader());

    expect(restored.isInitialized).toBe(true);
    expect(restored.enemyId).toBe(manager.enemyId);
    expect(restored.canForgetEnemy).toBe(true);
    expect(restored.enemyForgetable).toBe(false);
    expect(restored.enemyLastSeenPos).toEqual(manager.enemyLastSeenPos);
    expect(restored.combatType).toBe(EHelicopterCombatType.FLY_BY);
    expect(restored.flybyStatesForOnePass).toBe(1);
  });

  it("should correctly check combat-ignore configuration", () => {
    const { manager } = createCombatFixture();

    manager.combatIgnore = null;

    expect(manager.shouldCombatIgnore()).toBe(false);
  });

  it("should reset per-type initialization when combat type changes", () => {
    const { manager } = createCombatFixture();

    manager.combatType = EHelicopterCombatType.FLY_BY;
    manager.isFlybyInitialized = true;
    manager.isRoundInitialized = true;
    manager.isSearchInitialized = true;

    manager.setCombatType(EHelicopterCombatType.ROUND);

    expect(manager.combatType).toBe(EHelicopterCombatType.ROUND);
    expect(manager.isFlybyInitialized).toBe(false);
    expect(manager.isRoundInitialized).toBe(false);
    expect(manager.isSearchInitialized).toBe(false);
  });

  it("should update enemy visibility from the accumulated threshold", () => {
    const { enemy, manager } = createCombatFixture();

    manager.visibility = manager.visibilityThreshold;

    expect(manager.updateEnemyVisibility()).toBe(true);
    expect(manager.enemyLastSeenTime).toBe(1_000);
    expect(manager.enemyLastSeenPos).toEqual(enemy.position());

    manager.visibility = manager.visibilityThreshold - 1;
    expect(manager.updateEnemyVisibility()).toBe(false);
  });

  it("should forget a dead or timed-out enemy", () => {
    const { enemy, manager } = createCombatFixture();

    manager.isInitialized = true;
    manager.canForgetEnemy = true;
    manager.enemyForgetable = true;
    manager.forgetTimeout = 1;
    manager.enemyLastSeenTime = 0;

    manager.updateForgetting();

    expect(manager.isInitialized).toBe(false);
    expect(manager.enemyId).toBeNull();
    expect(manager.enemy).toBeNull();

    manager.enemy = enemy;
    manager.enemyId = enemy.id();
    manager.isInitialized = true;
    jest.spyOn(enemy, "alive").mockReturnValue(false);

    manager.updateForgetting();

    expect(manager.isInitialized).toBe(false);
  });

  it("should apply custom weapons and fly-by velocity once per section change", () => {
    const { manager } = createCombatFixture();

    manager.combatType = EHelicopterCombatType.FLY_BY;
    manager.combatUseMgun = true;
    manager.combatUseRocket = false;
    manager.isSectionChanged = true;
    manager.maxVelocity = 500;

    manager.updateCustomDataSettings();

    expect(manager.helicopter.m_use_mgun_on_attack).toBe(true);
    expect(manager.helicopter.m_use_rocket_on_attack).toBe(false);
    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(500);
    expect(manager.isSectionChanged).toBe(false);
  });

  it("should accumulate and clamp fastcall visibility", () => {
    const { enemy, manager } = createCombatFixture();

    manager.isInitialized = true;
    manager.enemy = enemy;
    manager.visibility = 99;
    manager.visibilityIncrement = 10;
    manager.visibilityNextTime = 0;
    jest.spyOn(manager.helicopter, "isVisible").mockReturnValue(true);

    expect(manager.fastcall()).toBe(false);
    expect(manager.visibility).toBe(100);

    manager.isInitialized = false;
    expect(manager.fastcall()).toBe(true);
  });

  it("should calculate a flight target at the configured safe altitude", () => {
    const { manager } = createCombatFixture();

    manager.enemyLastSeenPos = MockVector.mock(1, 0, 1);
    manager.safeAltitude = 400;

    expect(manager.calculatePositionInRadius(100).y).toBe(400);
  });

  it("should handle waypoints only for an active non-ignored enemy", () => {
    const { manager } = createCombatFixture();

    manager.combatIgnore = null;
    expect(manager.onWaypoint()).toBe(true);
    expect(manager.wasCallback).toBe(true);

    manager.enemyId = null;
    expect(manager.onWaypoint()).toBe(false);
  });
});
