import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import { setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ActionZombieShoot } from "@/engine/core/schemes/stalker/combat_zombied/actions/ActionZombieShoot";
import { MX_VECTOR, ONE_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, GameObject, Vector } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/database/stalker", () => ({
  setStalkerState: jest.fn(),
}));

describe("ActionZombieShoot", () => {
  beforeEach(() => {
    resetRegistry();

    GlobalSoundManager.getInstance().playSound = jest.fn(() => null);
  });

  it("should correctly initialize", () => {
    const enemy: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock({ best_enemy: () => enemy });
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieShoot = new ActionZombieShoot(state);

    action.setup(object, new property_storage());

    expect(action.state).toBe(state);

    action.previousState = EStalkerState.FIRE;
    action.enemyLastVertexId = 123;
    action.isValidPath = true;
    action.turnTime = 125;
    state.currentAction = EZombieCombatAction.DANGER;

    jest.spyOn(math, "random").mockImplementationOnce(() => 26);

    action.initialize();

    expect(object.set_desired_direction).toHaveBeenCalled();
    expect(object.set_detail_path_type).toHaveBeenCalledWith(move.line);
    expect(action.previousState).toBeNull();
    expect(action.enemyLastVertexId).toBeNull();
    expect(action.enemyLastSeenPosition).toBe(enemy.position());
    expect(action.enemyLastSeenVertexId).toBe(enemy.level_vertex_id());
    expect(action.isValidPath).toBe(false);
    expect(action.turnTime).toBe(0);
    expect(state.currentAction).toBe(EZombieCombatAction.SHOOT);
    expect(GlobalSoundManager.getInstance().playSound).not.toHaveBeenCalled();

    jest.spyOn(math, "random").mockImplementationOnce(() => 25);

    action.initialize();

    expect(GlobalSoundManager.getInstance().playSound).toHaveBeenCalledWith(object.id(), "fight_attack");
  });

  it("should correctly finalize", () => {
    const enemy: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock({ best_enemy: () => enemy });
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieShoot = new ActionZombieShoot(state);

    action.setup(object, new property_storage());

    expect(action.state).toBe(state);

    action.initialize();
    action.finalize();

    expect(state.currentAction).toBeNull();
  });

  it.todo("should correctly execute");

  it("should correctly set state", () => {
    const enemy: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock({ best_enemy: () => enemy });
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieShoot = new ActionZombieShoot(state);

    action.setup(object, new property_storage());

    action.setState(EStalkerState.FIRE, null, null);

    expect(action.targetStateDescriptor.lookObjectId).toBeNull();
    expect(action.targetStateDescriptor.lookPosition).toBeNull();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.FIRE, null, null, action.targetStateDescriptor);

    expect(action.previousState).toBe(EStalkerState.FIRE);

    action.enemyLastSeenPosition = MX_VECTOR;

    action.setState(EStalkerState.RAID_FIRE, enemy, ZERO_VECTOR);

    expect(action.targetStateDescriptor.lookObjectId).toBe(enemy.id());
    expect(action.targetStateDescriptor.lookPosition).toBe(MX_VECTOR);

    expect(setStalkerState).toHaveBeenCalledWith(
      object,
      EStalkerState.RAID_FIRE,
      null,
      null,
      action.targetStateDescriptor
    );

    expect(action.previousState).toBe(EStalkerState.RAID_FIRE);
  });

  it("should correctly get look direction", () => {
    const enemy: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock({ position: () => ONE_VECTOR, best_enemy: () => enemy });
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieShoot = new ActionZombieShoot(state);

    action.setup(object, new property_storage());

    jest.spyOn(math, "random").mockImplementationOnce(() => 1 / (Math.PI * 2));

    const first: Vector = action.getRandomLookDirection();

    expect(first).toEqual({
      x: 1.5403023058681398,
      y: 1,
      z: 1.8414709848078965,
    });

    jest.spyOn(math, "random").mockImplementationOnce(() => 1 / (Math.PI * 4));

    const second: Vector = action.getRandomLookDirection();

    expect(second).toEqual({
      x: 1.8775825618903728,
      y: 1,
      z: 1.479425538604203,
    });
  });

  it("should correctly handle hit", () => {
    const enemy: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock({ best_enemy: () => enemy });
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieShoot = new ActionZombieShoot(state);

    action.setup(object, new property_storage());

    action.onHit(object, 0.5, ZERO_VECTOR, null, 1);

    expect(action.wasHit).toBe(false);
    expect(action.enemyLastSeenPosition).toBeNull();
    expect(action.enemyLastSeenVertexId).toBeNull();

    action.onHit(object, 0.5, ZERO_VECTOR, enemy, 1);

    expect(action.wasHit).toBe(false);
    expect(action.enemyLastSeenPosition).toBeNull();
    expect(action.enemyLastSeenVertexId).toBeNull();

    state.currentAction = EZombieCombatAction.SHOOT;
    action.onHit(object, 0.5, ZERO_VECTOR, enemy, 1);

    expect(action.wasHit).toBe(true);
    expect(action.enemyLastSeenPosition).toBe(enemy.position());
    expect(action.enemyLastSeenVertexId).toBe(enemy.level_vertex_id());
  });
});
