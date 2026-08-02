import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter, get_hud, level, time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { ACTOR, AnyObject, NIL, TTimestamp } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject, registry } from "@/engine/core/database";
import { HelicopterFireController } from "@/engine/core/schemes/helicopter/heli_move/fire/HelicopterFireController";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

const NOW: TTimestamp = 100_000;

function createController(): { helicopter: CHelicopter; controller: HelicopterFireController; object: GameObject } {
  const object: GameObject = MockGameObject.mockHelicopter({ position: MockVector.create(0, 0, 0) });

  registerObject(object);

  const helicopter: CHelicopter = object.get_helicopter();

  jest.spyOn(helicopter, "isVisible").mockImplementation(() => true);

  return { helicopter, controller: new HelicopterFireController(object), object };
}

describe("HelicopterFireController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(time_global);
    resetFunctionMock(level.object_by_id);
    replaceFunctionMock(time_global, () => NOW);
    registry.simulator = MockAlifeSimulator.getInstance();
    get_hud().RemoveCustomStatic("cs_heli_health");
    mockRegisteredActor({ position: MockVector.create(1, 0, 0) });
  });

  it("should correctly initialize", () => {
    const { controller, object } = createController();

    expect(controller.object).toBe(object);
    expect(controller.enemy).toBeNull();
    expect(controller.enemyPreference).toBe(NIL);
    expect(controller.enemyDie).toBe(true);
    expect(controller.flagByEnemy).toBe(true);
    expect(controller.hitCount).toBe(0);
    expect(controller.showHealth).toBe(false);
  });

  it("should target the actor when preference is actor", () => {
    const { helicopter, controller } = createController();

    controller.enemyPreference = ACTOR;
    controller.setEnemy();

    expect(controller.enemy).toBe(registry.actor);
    expect(helicopter.SetEnemy).toHaveBeenCalledWith(registry.actor);
    expect(controller.flagByEnemy).toBe(false);
    expect(controller.enemyDie).toBe(false);
  });

  it("should target an object resolved by story id preference", () => {
    const { helicopter, controller } = createController();
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    replaceFunctionMock(level.object_by_id, () => target);

    registry.simulator = {
      story_object: jest.fn(() => ({ id: target.id() })),
    } as unknown as AnyObject as typeof registry.simulator;

    controller.enemyPreference = "1500";
    controller.setEnemy();

    expect(controller.enemyId).toBe(target.id());
    expect(controller.enemy).toBe(target);
    expect(helicopter.SetEnemy).toHaveBeenCalledWith(target);
  });

  it("should mark enemy as dead when nothing can be targeted", () => {
    const { controller } = createController();

    controller.enemyPreference = NIL;
    controller.setEnemy();

    expect(controller.enemy).toBeNull();
    expect(controller.enemyDie).toBe(true);
  });

  it("should fall back to fire point when enemy is dead", () => {
    const { helicopter, controller } = createController();
    const firePoint = MockVector.create(4, 5, 6);

    controller.firePoint = firePoint;
    controller.enemyPreference = NIL;
    controller.setEnemy();

    expect(helicopter.SetEnemy).toHaveBeenCalledWith(firePoint);
  });

  it("should keep an already visible enemy", () => {
    const { helicopter, controller } = createController();
    const enemy: GameObject = MockGameObject.mock();

    controller.enemy = enemy;
    controller.setEnemy();

    expect(helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(controller.flagByEnemy).toBe(false);
  });

  it("should clear enemy that died", () => {
    const { helicopter, controller } = createController();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(enemy, "death_time").mockImplementation(() => 1);

    controller.enemy = enemy;
    controller.enemyDie = false;
    controller.flagByEnemy = false;
    controller.setEnemy();

    expect(helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(controller.enemyDie).toBe(true);
  });

  it("should reset by-enemy flag after several hits", () => {
    const { controller } = createController();

    controller.hitCount = 3;
    controller.flagByEnemy = false;
    controller.enemyPreference = NIL;

    controller.updateEnemyState();

    expect(controller.hitCount).toBe(0);
    expect(controller.flagByEnemy).toBe(false);
  });

  it("should re-select enemy when the current one is not visible", () => {
    const { helicopter, controller } = createController();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(helicopter, "isVisible").mockImplementation(() => false);

    controller.enemy = enemy;
    controller.enemyPreference = "all";
    controller.enemyTime = NOW - 10_000;
    controller.enemyDie = false;

    jest.spyOn(controller, "updateEnemyArr").mockImplementation(jest.fn());

    controller.updateEnemyState();

    expect(controller.updateEnemyArr).toHaveBeenCalled();
    expect(controller.enemyTime).toBe(NOW);
    expect(controller.flagByEnemy).toBe(true);
  });

  it("should re-select enemy array when current enemy died", () => {
    const { controller } = createController();

    controller.enemy = MockGameObject.mock();
    controller.enemyDie = true;
    controller.enemyPreference = "all";

    jest.spyOn(controller, "updateEnemyArr").mockImplementation(jest.fn());

    controller.updateEnemyState();

    expect(controller.updateEnemyArr).toHaveBeenCalled();
  });

  it("should pick the closest visible registered enemy", () => {
    const { helicopter, controller } = createController();
    const near: GameObject = MockGameObject.mock({ position: MockVector.create(1, 0, 0) });
    const far: GameObject = MockGameObject.mock({ position: MockVector.create(50, 0, 0) });

    registry.helicopter.enemies.set(0, near);
    registry.helicopter.enemies.set(1, far);
    registry.helicopter.enemyIndex = 2;

    jest.spyOn(helicopter, "isVisible").mockImplementation((it) => it !== registry.actor);

    controller.updateEnemyArr();

    expect(controller.enemy).toBe(near);
    expect(controller.flagByEnemy).toBe(true);
  });

  it("should skip invisible registered enemies", () => {
    const { helicopter, controller } = createController();

    registry.helicopter.enemies.set(0, MockGameObject.mock({ position: MockVector.create(1, 0, 0) }));
    registry.helicopter.enemyIndex = 1;

    jest.spyOn(helicopter, "isVisible").mockImplementation(() => false);

    controller.updateEnemyArr();

    expect(controller.enemy).toBeNull();
  });

  it("should fall back to the actor when no enemies are registered", () => {
    const { controller } = createController();

    registry.helicopter.enemyIndex = 0;

    controller.updateEnemyArr();

    expect(controller.enemy).toBe(registry.actor);
  });

  it("should show and update the combat health hud", () => {
    const { helicopter, controller } = createController();

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);

    controller.showHelicopterFightUI();

    expect(get_hud().GetCustomStatic("cs_heli_health")).not.toBeNull();
    expect(controller.uiProgressBar?.IsShown()).toBe(true);
    expect(controller.uiProgressBar?.SetProgressPos).toHaveBeenCalledWith(50);
    expect(controller.uiProgressBar?.GetProgressPos()).toBe(50);

    // Repeated calls reuse the existing static.
    controller.showHelicopterFightUI();

    expect(controller.uiProgressBar?.SetProgressPos).toHaveBeenCalledTimes(1);
  });

  it("should hide the combat health hud once health reaches zero", () => {
    const { helicopter, controller } = createController();

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);
    controller.showHelicopterFightUI();
    controller.showHealth = true;

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0);
    controller.setHelicopterFightUIHealth();

    expect(controller.uiProgressBar?.IsShown()).toBe(false);
    expect(controller.showHealth).toBe(false);
    expect(get_hud().GetCustomStatic("cs_heli_health")).toBeNull();
  });

  it("should not update hud health when it is not shown", () => {
    const { controller } = createController();

    expect(() => controller.setHelicopterFightUIHealth()).not.toThrow();
    expect(controller.uiProgressBar).toBeNull();
  });

  it("should remove the combat health hud", () => {
    const { helicopter, controller } = createController();

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);
    controller.showHelicopterFightUI();

    controller.removeHelicopterFightUI();
    expect(get_hud().GetCustomStatic("cs_heli_health")).toBeNull();

    // Removing an absent static is a no-op.
    expect(() => controller.removeHelicopterFightUI()).not.toThrow();
  });

  it("should count repeated hits from the same enemy", () => {
    const { controller } = createController();
    const enemy: GameObject = MockGameObject.mock();

    controller.enemy = enemy;
    controller.enemyPreference = ACTOR;

    controller.onHit();
    expect(controller.fireId).toBe(enemy.id());
    expect(controller.hitCount).toBe(1);

    controller.onHit();
    expect(controller.hitCount).toBe(2);
  });

  it("should reset hit count for repeated hits without enemy preference", () => {
    const { controller } = createController();
    const enemy: GameObject = MockGameObject.mock();

    controller.enemy = enemy;
    controller.enemyPreference = NIL;

    controller.onHit();
    controller.onHit();

    expect(controller.hitCount).toBe(0);
  });

  it("should refresh hud on hit depending on health visibility", () => {
    const { helicopter, controller } = createController();

    controller.enemy = MockGameObject.mock();
    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);

    controller.showHelicopterFightUI();
    controller.showHealth = true;
    controller.onHit();

    expect(controller.uiProgressBar?.SetProgressPos).toHaveBeenCalledTimes(2);

    controller.showHealth = false;
    controller.onHit();

    expect(get_hud().GetCustomStatic("cs_heli_health")).toBeNull();
  });
});
