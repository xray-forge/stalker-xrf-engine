import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter, get_hud, level, time_global } from "xray16";
import { GameObject, XmlInit } from "xray16/alias";
import { ACTOR, AnyObject, NIL, TTimestamp } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject, registry } from "@/engine/core/database";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire/HelicopterFireManager";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

// `MockCScriptXmlInit.InitProgressBar` still returns `MockCUIWindow`, which has no `SetProgressPos`.
// todo: Drop this stand-in once `xray16` mocks ship a progress bar mock.
const uiProgressBar = { SetProgressPos: jest.fn(), Show: jest.fn() };

jest.mock("@/engine/core/utils/ui", () => {
  const actual = jest.requireActual("@/engine/core/utils/ui") as Record<string, unknown>;

  return { ...actual, resolveXmlFile: jest.fn() };
});

const NOW: TTimestamp = 100_000;

function createManager(): { helicopter: CHelicopter; manager: HelicopterFireManager; object: GameObject } {
  const object: GameObject = MockGameObject.mockHelicopter({ position: MockVector.create(0, 0, 0) });

  registerObject(object);

  const helicopter: CHelicopter = object.get_helicopter();

  jest.spyOn(helicopter, "isVisible").mockImplementation(() => true);

  return { helicopter, manager: new HelicopterFireManager(object), object };
}

describe("HelicopterFireManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(time_global);
    resetFunctionMock(level.object_by_id);
    replaceFunctionMock(time_global, () => NOW);
    resetFunctionMock(resolveXmlFile);
    uiProgressBar.SetProgressPos.mockReset();
    uiProgressBar.Show.mockReset();
    replaceFunctionMock(resolveXmlFile, () => ({ InitProgressBar: () => uiProgressBar }) as unknown as XmlInit);
    registry.simulator = MockAlifeSimulator.getInstance();
    get_hud().RemoveCustomStatic("cs_heli_health");
    mockRegisteredActor({ position: MockVector.create(1, 0, 0) });
  });

  it("should correctly initialize", () => {
    const { manager, object } = createManager();

    expect(manager.object).toBe(object);
    expect(manager.enemy).toBeNull();
    expect(manager.enemyPreference).toBe(NIL);
    expect(manager.enemyDie).toBe(true);
    expect(manager.flagByEnemy).toBe(true);
    expect(manager.hitCount).toBe(0);
    expect(manager.showHealth).toBe(false);
  });

  it("should target the actor when preference is actor", () => {
    const { helicopter, manager } = createManager();

    manager.enemyPreference = ACTOR;
    manager.setEnemy();

    expect(manager.enemy).toBe(registry.actor);
    expect(helicopter.SetEnemy).toHaveBeenCalledWith(registry.actor);
    expect(manager.flagByEnemy).toBe(false);
    expect(manager.enemyDie).toBe(false);
  });

  it("should target an object resolved by story id preference", () => {
    const { helicopter, manager } = createManager();
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    replaceFunctionMock(level.object_by_id, () => target);

    registry.simulator = {
      story_object: jest.fn(() => ({ id: target.id() })),
    } as unknown as AnyObject as typeof registry.simulator;

    manager.enemyPreference = "1500";
    manager.setEnemy();

    expect(manager.enemyId).toBe(target.id());
    expect(manager.enemy).toBe(target);
    expect(helicopter.SetEnemy).toHaveBeenCalledWith(target);
  });

  it("should mark enemy as dead when nothing can be targeted", () => {
    const { manager } = createManager();

    manager.enemyPreference = NIL;
    manager.setEnemy();

    expect(manager.enemy).toBeNull();
    expect(manager.enemyDie).toBe(true);
  });

  it("should fall back to fire point when enemy is dead", () => {
    const { helicopter, manager } = createManager();
    const firePoint = MockVector.create(4, 5, 6);

    manager.firePoint = firePoint;
    manager.enemyPreference = NIL;
    manager.setEnemy();

    expect(helicopter.SetEnemy).toHaveBeenCalledWith(firePoint);
  });

  it("should keep an already visible enemy", () => {
    const { helicopter, manager } = createManager();
    const enemy: GameObject = MockGameObject.mock();

    manager.enemy = enemy;
    manager.setEnemy();

    expect(helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(helicopter.SetEnemy).toHaveBeenCalledWith(enemy);
    expect(manager.flagByEnemy).toBe(false);
  });

  it("should clear enemy that died", () => {
    const { helicopter, manager } = createManager();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(enemy, "death_time").mockImplementation(() => 1);

    manager.enemy = enemy;
    manager.enemyDie = false;
    manager.flagByEnemy = false;
    manager.setEnemy();

    expect(helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
    expect(manager.enemyDie).toBe(true);
  });

  it("should reset by-enemy flag after several hits", () => {
    const { manager } = createManager();

    manager.hitCount = 3;
    manager.flagByEnemy = false;
    manager.enemyPreference = NIL;

    manager.updateEnemyState();

    expect(manager.hitCount).toBe(0);
    expect(manager.flagByEnemy).toBe(false);
  });

  it("should re-select enemy when the current one is not visible", () => {
    const { helicopter, manager } = createManager();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(helicopter, "isVisible").mockImplementation(() => false);

    manager.enemy = enemy;
    manager.enemyPreference = "all";
    manager.enemyTime = NOW - 10_000;
    manager.enemyDie = false;

    jest.spyOn(manager, "updateEnemyArr").mockImplementation(jest.fn());

    manager.updateEnemyState();

    expect(manager.updateEnemyArr).toHaveBeenCalled();
    expect(manager.enemyTime).toBe(NOW);
    expect(manager.flagByEnemy).toBe(true);
  });

  it("should re-select enemy array when current enemy died", () => {
    const { manager } = createManager();

    manager.enemy = MockGameObject.mock();
    manager.enemyDie = true;
    manager.enemyPreference = "all";

    jest.spyOn(manager, "updateEnemyArr").mockImplementation(jest.fn());

    manager.updateEnemyState();

    expect(manager.updateEnemyArr).toHaveBeenCalled();
  });

  it("should pick the closest visible registered enemy", () => {
    const { helicopter, manager } = createManager();
    const near: GameObject = MockGameObject.mock({ position: MockVector.create(1, 0, 0) });
    const far: GameObject = MockGameObject.mock({ position: MockVector.create(50, 0, 0) });

    registry.helicopter.enemies.set(0, near);
    registry.helicopter.enemies.set(1, far);
    registry.helicopter.enemyIndex = 2;

    jest.spyOn(helicopter, "isVisible").mockImplementation((it) => it !== registry.actor);

    manager.updateEnemyArr();

    expect(manager.enemy).toBe(near);
    expect(manager.flagByEnemy).toBe(true);
  });

  it("should skip invisible registered enemies", () => {
    const { helicopter, manager } = createManager();

    registry.helicopter.enemies.set(0, MockGameObject.mock({ position: MockVector.create(1, 0, 0) }));
    registry.helicopter.enemyIndex = 1;

    jest.spyOn(helicopter, "isVisible").mockImplementation(() => false);

    manager.updateEnemyArr();

    expect(manager.enemy).toBeNull();
  });

  it("should fall back to the actor when no enemies are registered", () => {
    const { manager } = createManager();

    registry.helicopter.enemyIndex = 0;

    manager.updateEnemyArr();

    expect(manager.enemy).toBe(registry.actor);
  });

  it("should show and update the combat health hud", () => {
    const { helicopter, manager } = createManager();

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);

    manager.showHelicopterFightUI();

    expect(get_hud().GetCustomStatic("cs_heli_health")).not.toBeNull();
    expect(manager.uiProgressBar?.Show).toHaveBeenCalledWith(true);
    expect(manager.uiProgressBar?.SetProgressPos).toHaveBeenCalledWith(50);

    // Repeated calls reuse the existing static.
    manager.showHelicopterFightUI();

    expect(manager.uiProgressBar?.SetProgressPos).toHaveBeenCalledTimes(1);
  });

  it("should hide the combat health hud once health reaches zero", () => {
    const { helicopter, manager } = createManager();

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);
    manager.showHelicopterFightUI();
    manager.showHealth = true;

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0);
    manager.setHelicopterFightUIHealth();

    expect(manager.uiProgressBar?.Show).toHaveBeenCalledWith(false);
    expect(manager.showHealth).toBe(false);
    expect(get_hud().GetCustomStatic("cs_heli_health")).toBeNull();
  });

  it("should not update hud health when it is not shown", () => {
    const { manager } = createManager();

    expect(() => manager.setHelicopterFightUIHealth()).not.toThrow();
    expect(manager.uiProgressBar).toBeNull();
  });

  it("should remove the combat health hud", () => {
    const { helicopter, manager } = createManager();

    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);
    manager.showHelicopterFightUI();

    manager.removeHelicopterFightUI();
    expect(get_hud().GetCustomStatic("cs_heli_health")).toBeNull();

    // Removing an absent static is a no-op.
    expect(() => manager.removeHelicopterFightUI()).not.toThrow();
  });

  it("should count repeated hits from the same enemy", () => {
    const { manager } = createManager();
    const enemy: GameObject = MockGameObject.mock();

    manager.enemy = enemy;
    manager.enemyPreference = ACTOR;

    manager.onHit();
    expect(manager.fireId).toBe(enemy.id());
    expect(manager.hitCount).toBe(1);

    manager.onHit();
    expect(manager.hitCount).toBe(2);
  });

  it("should reset hit count for repeated hits without enemy preference", () => {
    const { manager } = createManager();
    const enemy: GameObject = MockGameObject.mock();

    manager.enemy = enemy;
    manager.enemyPreference = NIL;

    manager.onHit();
    manager.onHit();

    expect(manager.hitCount).toBe(0);
  });

  it("should refresh hud on hit depending on health visibility", () => {
    const { helicopter, manager } = createManager();

    manager.enemy = MockGameObject.mock();
    jest.spyOn(helicopter, "GetfHealth").mockImplementation(() => 0.5);

    manager.showHelicopterFightUI();
    manager.showHealth = true;
    manager.onHit();

    expect(manager.uiProgressBar?.SetProgressPos).toHaveBeenCalledTimes(2);

    manager.showHealth = false;
    manager.onHit();

    expect(get_hud().GetCustomStatic("cs_heli_health")).toBeNull();
  });
});
