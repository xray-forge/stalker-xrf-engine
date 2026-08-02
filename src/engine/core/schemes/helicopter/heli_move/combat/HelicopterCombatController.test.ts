import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockNetProcessor, MockVector } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { registerObject } from "@/engine/core/database";
import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";
import { EHelicopterCombatType } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { resetRegistry } from "@/fixtures/engine";

interface ICombatFixture {
  enemy: GameObject;
  controller: HelicopterCombatController;
  object: GameObject;
}

function createCombatFixture(): ICombatFixture {
  const object: GameObject = MockGameObject.mockHelicopter();
  const enemy: GameObject = MockGameObject.mock({ id: 100 });

  registerObject(object);

  const controller: HelicopterCombatController = new HelicopterCombatController(object);

  controller.enemy = enemy;
  controller.enemyId = enemy.id();
  controller.enemyLastSeenPos = MockVector.mock(1, 2, 3);
  controller.enemyLastSeenTime = 0;

  return { enemy, controller, object };
}

describe("HelicopterCombatController", () => {
  beforeEach(() => {
    resetRegistry();
    replaceFunctionMock(time_global, () => 1_000);
  });

  it("should correctly initialize", () => {
    const { enemy, controller, object } = createCombatFixture();

    controller.initialize();

    expect(controller.isInitialized).toBe(true);
    expect(controller.combatType).toBe(EHelicopterCombatType.FLY_BY);
    expect(controller.enemyLastSeenPos).toEqual(enemy.position());
    expect(controller.canForgetEnemy).toBe(false);
    expect(controller.isSectionChanged).toBe(true);
    expect(controller.helicopter.m_max_mgun_dist).toBe(controller.mMaxMGunDist);
    expect(object.set_fastcall).toHaveBeenCalledWith(controller.fastcall, controller);
  });

  it("should correctly save and load fly-by combat state", () => {
    const { controller, object } = createCombatFixture();
    const packet: MockNetProcessor = new MockNetProcessor();

    controller.isInitialized = true;
    controller.canForgetEnemy = true;
    controller.enemyForgetable = false;
    controller.combatType = EHelicopterCombatType.FLY_BY;
    controller.flybyStatesForOnePass = 1;

    controller.save(packet.asNetPacket());

    const restored: HelicopterCombatController = new HelicopterCombatController(object);

    restored.load(packet.asNetReader());

    expect(restored.isInitialized).toBe(true);
    expect(restored.enemyId).toBe(controller.enemyId);
    expect(restored.canForgetEnemy).toBe(true);
    expect(restored.enemyForgetable).toBe(false);
    expect(restored.enemyLastSeenPos).toEqual(controller.enemyLastSeenPos);
    expect(restored.combatType).toBe(EHelicopterCombatType.FLY_BY);
    expect(restored.flybyStatesForOnePass).toBe(1);
  });

  it("should correctly check combat-ignore configuration", () => {
    const { controller } = createCombatFixture();

    controller.combatIgnore = null;

    expect(controller.shouldCombatIgnore()).toBe(false);
  });

  it("should reset per-type initialization when combat type changes", () => {
    const { controller } = createCombatFixture();

    controller.combatType = EHelicopterCombatType.FLY_BY;
    controller.isFlybyInitialized = true;
    controller.isRoundInitialized = true;
    controller.isSearchInitialized = true;

    controller.setCombatType(EHelicopterCombatType.ROUND);

    expect(controller.combatType).toBe(EHelicopterCombatType.ROUND);
    expect(controller.isFlybyInitialized).toBe(false);
    expect(controller.isRoundInitialized).toBe(false);
    expect(controller.isSearchInitialized).toBe(false);
  });

  it("should update enemy visibility from the accumulated threshold", () => {
    const { enemy, controller } = createCombatFixture();

    controller.visibility = controller.visibilityThreshold;

    expect(controller.updateEnemyVisibility()).toBe(true);
    expect(controller.enemyLastSeenTime).toBe(1_000);
    expect(controller.enemyLastSeenPos).toEqual(enemy.position());

    controller.visibility = controller.visibilityThreshold - 1;
    expect(controller.updateEnemyVisibility()).toBe(false);
  });

  it("should forget a dead or timed-out enemy", () => {
    const { enemy, controller } = createCombatFixture();

    controller.isInitialized = true;
    controller.canForgetEnemy = true;
    controller.enemyForgetable = true;
    controller.forgetTimeout = 1;
    controller.enemyLastSeenTime = 0;

    controller.updateForgetting();

    expect(controller.isInitialized).toBe(false);
    expect(controller.enemyId).toBeNull();
    expect(controller.enemy).toBeNull();

    controller.enemy = enemy;
    controller.enemyId = enemy.id();
    controller.isInitialized = true;
    jest.spyOn(enemy, "alive").mockReturnValue(false);

    controller.updateForgetting();

    expect(controller.isInitialized).toBe(false);
  });

  it("should apply custom weapons and fly-by velocity once per section change", () => {
    const { controller } = createCombatFixture();

    controller.combatType = EHelicopterCombatType.FLY_BY;
    controller.combatUseMgun = true;
    controller.combatUseRocket = false;
    controller.isSectionChanged = true;
    controller.maxVelocity = 500;

    controller.updateCustomDataSettings();

    expect(controller.helicopter.m_use_mgun_on_attack).toBe(true);
    expect(controller.helicopter.m_use_rocket_on_attack).toBe(false);
    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledWith(500);
    expect(controller.isSectionChanged).toBe(false);
  });

  it("should accumulate and clamp fastcall visibility", () => {
    const { enemy, controller } = createCombatFixture();

    controller.isInitialized = true;
    controller.enemy = enemy;
    controller.visibility = 99;
    controller.visibilityIncrement = 10;
    controller.visibilityNextTime = 0;
    jest.spyOn(controller.helicopter, "isVisible").mockReturnValue(true);

    expect(controller.fastcall()).toBe(false);
    expect(controller.visibility).toBe(100);

    controller.isInitialized = false;
    expect(controller.fastcall()).toBe(true);
  });

  it("should calculate a flight target at the configured safe altitude", () => {
    const { controller } = createCombatFixture();

    controller.enemyLastSeenPos = MockVector.mock(1, 0, 1);
    controller.safeAltitude = 400;

    expect(controller.calculatePositionInRadius(100).y).toBe(400);
  });

  it("should handle waypoints only for an active non-ignored enemy", () => {
    const { controller } = createCombatFixture();

    controller.combatIgnore = null;
    expect(controller.onWaypoint()).toBe(true);
    expect(controller.wasCallback).toBe(true);

    controller.enemyId = null;
    expect(controller.onWaypoint()).toBe(false);
  });
});
