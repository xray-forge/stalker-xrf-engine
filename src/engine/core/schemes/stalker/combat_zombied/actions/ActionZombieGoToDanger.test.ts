import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { danger_object, move, property_storage, time_global } from "xray16";
import { EGameObjectPath, GameObject } from "xray16/alias";
import { ZERO_VECTOR } from "xray16/lib";
import { MockDangerObject, MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { setStalkerState } from "@/engine/core/database";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ActionZombieGoToDanger } from "@/engine/core/schemes/stalker/combat_zombied/actions/ActionZombieGoToDanger";
import { EScheme } from "@/engine/core/schemes/types";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({
  setStalkerState: jest.fn(),
}));

jest.mock("@/engine/core/utils/position", () => ({
  sendToNearestAccessibleVertex: jest.fn(),
}));

describe("ActionZombieGoToDanger", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    action.setup(object, new property_storage());

    expect(action.state).toBe(state);

    state.currentAction = EZombieCombatAction.SHOOT;
    action.lastState = EStalkerState.FIRE;
    action.bestDangerObjectId = 1;
    action.bestDangerObjectVertexId = 2;
    action.lastSentVertexId = 3;

    action.initialize();

    expect(object.set_desired_direction).toHaveBeenCalled();
    expect(object.set_detail_path_type).toHaveBeenCalledWith(move.line);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);

    expect(state.currentAction).toBe(EZombieCombatAction.DANGER);
    expect(action.lastState).toBeNull();
    expect(action.bestDangerObjectId).toBeNull();
    expect(action.bestDangerObjectVertexId).toBeNull();
    expect(action.lastSentVertexId).toBeNull();
  });

  it("should correctly finalize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    action.setup(object, new property_storage());
    action.initialize();
    action.finalize();

    expect(state.currentAction).toBeNull();
  });

  it("should move towards a non-grenade danger and raid it", () => {
    const object: GameObject = MockGameObject.mock();
    const dangerObject: GameObject = MockGameObject.mock({ id: 100, levelVertexId: 200 });
    const danger: MockDangerObject = MockDangerObject.create();
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    danger.dangerObject = dangerObject;
    danger.dangerType = danger_object.attacked;
    jest.spyOn(object, "best_danger").mockReturnValue(danger.asMock());
    replaceFunctionMock(time_global, () => 1_000);

    action.setup(object, new property_storage());
    action.execute();

    expect(action.bestDangerObjectId).toBe(dangerObject.id());
    expect(action.bestDangerObjectVertexId).toBe(dangerObject.level_vertex_id());
    expect(action.lastSentVertexId).toBe(dangerObject.level_vertex_id());
    expect(sendToNearestAccessibleVertex).toHaveBeenCalledWith(object, dangerObject.level_vertex_id());
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.RAID, null, null, {
      lookObjectId: undefined,
      lookPosition: danger.position(),
    });
  });

  it("should not apply the same state twice", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    action.setup(object, new property_storage());
    action.setState(EStalkerState.RAID, null, ZERO_VECTOR);
    action.setState(EStalkerState.RAID, null, ZERO_VECTOR);

    expect(setStalkerState).toHaveBeenCalledTimes(1);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.RAID, null, null, {
      lookObjectId: undefined,
      lookPosition: ZERO_VECTOR,
    });
  });

  it("should react to a hit only while handling danger and when a danger source exists", () => {
    const object: GameObject = MockGameObject.mock();
    const attacker: GameObject = MockGameObject.mock({ id: 100, levelVertexId: 200 });
    const danger: MockDangerObject = MockDangerObject.create();
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const action: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    danger.dangerObject = attacker;
    danger.dangerType = danger_object.attacked;
    jest.spyOn(object, "best_danger").mockReturnValue(danger.asMock());

    action.setup(object, new property_storage());
    action.onHit(object, 1, ZERO_VECTOR, attacker, 0);
    expect(action.wasHit).toBe(false);

    state.currentAction = EZombieCombatAction.DANGER;
    action.onHit(object, 1, ZERO_VECTOR, attacker, 0);

    expect(action.wasHit).toBe(true);
    expect(action.enemyLastSeenPos).toBe(attacker.position());
    expect(action.enemyLastSeenVid).toBe(attacker.level_vertex_id());
  });
});
