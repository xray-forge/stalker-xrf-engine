import { beforeEach, describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ActionZombieGoToDanger } from "@/engine/core/schemes/stalker/combat_zombied/actions/ActionZombieGoToDanger";
import { EGameObjectPath, EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

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

  it.todo("should correctly execute");

  it.todo("should correctly set states");

  it.todo("should correctly handle hit");
});
