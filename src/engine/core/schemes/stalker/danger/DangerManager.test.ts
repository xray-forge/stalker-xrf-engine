import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { snd_type, time_global } from "xray16";
import { EGameObjectRelation, GameObject } from "xray16/alias";
import { TTimestamp } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject } from "@/engine/core/database";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger/danger_types";
import { DangerManager } from "@/engine/core/schemes/stalker/danger/DangerManager";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/stalker/danger/utils", () => ({ canObjectSelectAsEnemy: jest.fn(() => true) }));

const NOW: TTimestamp = 100_000;

function createManager(): { manager: DangerManager; object: GameObject; state: ISchemeDangerState } {
  const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
  const state: ISchemeDangerState = mockSchemeState<ISchemeDangerState>(EScheme.DANGER, { dangerTime: null });

  registerObject(object);

  return { manager: new DangerManager(object, state), object, state };
}

/**
 * Register a sound source object that the listener treats as an enemy.
 */
function registerEnemySource(object: GameObject): GameObject {
  const who: GameObject = MockGameObject.mock();

  registerObject(who);
  jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY);

  return who;
}

describe("DangerManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(canObjectSelectAsEnemy);
    resetFunctionMock(time_global);
    replaceFunctionMock(canObjectSelectAsEnemy, () => true);
    replaceFunctionMock(time_global, () => NOW);
  });

  it("should ignore sounds from unregistered objects", () => {
    const { manager, object, state } = createManager();

    manager.onHear(object, 9999, snd_type.weapon_bullet_hit, MockVector.create(0, 0, 0), 1);

    expect(state.dangerTime).toBeNull();
  });

  it("should ignore sounds while already in combat", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    manager.onHear(object, who.id(), snd_type.weapon_bullet_hit, MockVector.create(0, 0, 0), 1);

    expect(state.dangerTime).toBeNull();
  });

  it("should ignore sounds from objects that cannot be enemies", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    replaceFunctionMock(canObjectSelectAsEnemy, () => false);

    manager.onHear(object, who.id(), snd_type.weapon_bullet_hit, MockVector.create(0, 0, 0), 1);

    expect(state.dangerTime).toBeNull();
  });

  it("should enter danger on nearby enemy bullet hit", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    // `MockVector.distance_to` is only a real distance when one of the vectors sits at the origin.
    manager.onHear(object, who.id(), snd_type.weapon_bullet_hit, MockVector.create(1, 0, 0), 1);

    expect(state.dangerTime).toBe(NOW);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(who.level_vertex_id());
  });

  it("should ignore distant bullet hits", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    manager.onHear(object, who.id(), snd_type.weapon_bullet_hit, MockVector.create(100, 100, 100), 1);

    expect(state.dangerTime).toBeNull();
  });

  it("should ignore bullet hits from non enemies", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = MockGameObject.mock();

    registerObject(who);
    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND);

    manager.onHear(object, who.id(), snd_type.weapon_bullet_hit, MockVector.create(0, 0, 0), 1);

    expect(state.dangerTime).toBeNull();
  });

  it("should enter danger on nearby enemy weapon sound", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    manager.onHear(object, who.id(), snd_type.weapon, MockVector.create(1, 0, 0), 1);

    expect(state.dangerTime).toBe(NOW);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(who.level_vertex_id());
  });

  it("should assist allies shooting at a mutual enemy", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = MockGameObject.mock();
    const shootingAt: GameObject = MockGameObject.mock();

    registerObject(who);
    jest.spyOn(who, "best_enemy").mockImplementation(() => shootingAt);
    jest
      .spyOn(object, "relation")
      .mockImplementation((target) => (target === shootingAt ? EGameObjectRelation.ENEMY : EGameObjectRelation.FRIEND));

    manager.onHear(object, who.id(), snd_type.weapon, MockVector.create(1, 0, 0), 1);

    expect(state.dangerTime).toBe(NOW);
  });

  it("should ignore distant weapon sounds", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    manager.onHear(object, who.id(), snd_type.weapon, MockVector.create(1000, 1000, 1000), 1);

    expect(state.dangerTime).toBeNull();
  });

  it("should ignore unrelated sound types", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = registerEnemySource(object);

    manager.onHear(object, who.id(), snd_type.monster, MockVector.create(0, 0, 0), 1);

    expect(state.dangerTime).toBeNull();
  });
});
