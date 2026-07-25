import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { TTimestamp, ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { registerObject, setStalkerState } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ActionLookAround } from "@/engine/core/schemes/stalker/combat_camper/actions/ActionLookAround";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({ setStalkerState: jest.fn() }));

const NOW: TTimestamp = 100_000;

function createAction(base: Partial<ISchemeCombatState> = {}): {
  action: ActionLookAround;
  object: GameObject;
  state: ISchemeCombatState;
} {
  const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
  const state: ISchemeCombatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, {
    isCamperCombatAction: null,
    lastSeenEnemyAtPosition: null,
    ...base,
  });
  const action: ActionLookAround = new ActionLookAround(state);

  registerObject(object);
  action.setup(object, MockPropertyStorage.mock());

  return { action, object, state };
}

describe("ActionLookAround", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
    resetFunctionMock(time_global);
    replaceFunctionMock(time_global, () => NOW);
  });

  it("should correctly initialize", () => {
    const { action, state } = createAction();

    expect(action.forgetTime).toBe(0);
    expect(action.changeDirTime).toBe(0);

    action.initialize();

    expect(state.isCamperCombatAction).toBe(true);
    expect(action.forgetTime).toBe(NOW + combatConfig.LAST_SEEN_POSITION_TIMEOUT);
    expect(action.changeDirTime).toBe(NOW + combatConfig.SEARCH_DIRECTION_CHANGE_TIMEOUT);
  });

  it("should remember enemy position on reset when it is not known yet", () => {
    const { action, object, state } = createAction();
    const enemy: GameObject = MockGameObject.mock({ position: MockVector.create(6, 7, 8) });

    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);

    action.reset();

    expect(state.lastSeenEnemyAtPosition).toEqual(MockVector.create(6, 7, 8));
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.HIDE, null, null, {
      lookPosition: state.lastSeenEnemyAtPosition,
    });
  });

  it("should keep known enemy position on reset", () => {
    const known = MockVector.create(1, 2, 3);
    const { action, object, state } = createAction({ lastSeenEnemyAtPosition: known });

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    action.reset();

    expect(state.lastSeenEnemyAtPosition).toBe(known);
  });

  it("should forget the search position once the timeout passes", () => {
    const { action, state } = createAction({ lastSeenEnemyAtPosition: MockVector.create(1, 2, 3) });

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.forgetTime = NOW - 1;
    action.execute();

    expect(state.lastSeenEnemyAtPosition).toBeNull();
    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should do nothing before direction change timeout", () => {
    const { action, state } = createAction({ lastSeenEnemyAtPosition: MockVector.create(1, 2, 3) });

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.execute();

    expect(state.lastSeenEnemyAtPosition).not.toBeNull();
    expect(setStalkerState).not.toHaveBeenCalled();
  });

  it("should look in a new direction once the change timeout passes", () => {
    const { action, object, state } = createAction({ lastSeenEnemyAtPosition: MockVector.create(1, 2, 3) });

    action.initialize();
    resetFunctionMock(setStalkerState);

    action.changeDirTime = NOW - 1;
    action.execute();

    expect(action.changeDirTime).toBeGreaterThanOrEqual(NOW + combatConfig.SEARCH_DIRECTION_CHANGE_PERIOD.MIN);
    expect(action.changeDirTime).toBeLessThanOrEqual(NOW + combatConfig.SEARCH_DIRECTION_CHANGE_PERIOD.MAX);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.HIDE, null, null, {
      lookPosition: expect.anything(),
    });
    expect(state.lastSeenEnemyAtPosition).not.toBeNull();
  });

  it("should fail direction change without known enemy position", () => {
    const { action } = createAction();

    action.initialize();

    action.forgetTime = NOW + 1000;
    action.changeDirTime = NOW - 1;

    expect(() => action.execute()).toThrow("report this error to STALKER-829 bug");
  });

  it("should reset state on finalize", () => {
    const { action, state } = createAction({ lastSeenEnemyAtPosition: MockVector.create(1, 2, 3) });

    action.initialize();
    action.finalize();

    expect(state.lastSeenEnemyAtPosition).toBeNull();
    expect(state.isCamperCombatAction).toBe(false);
  });

  it("should ignore hits without source or outside of camper combat", () => {
    const { action, object, state } = createAction();

    jest.spyOn(action, "reset");

    action.onHit(object, 10, ZERO_VECTOR, null);
    expect(action.reset).not.toHaveBeenCalled();

    state.isCamperCombatAction = false;
    action.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock());
    expect(action.reset).not.toHaveBeenCalled();
  });

  it("should ignore hits from objects that are not the current enemy", () => {
    const { action, object, state } = createAction();

    state.isCamperCombatAction = true;
    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    jest.spyOn(action, "reset");

    action.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock());

    expect(action.reset).not.toHaveBeenCalled();
  });

  it("should refresh search position on hit from the current enemy", () => {
    const { action, object, state } = createAction();
    const enemy: GameObject = MockGameObject.mock({ position: MockVector.create(9, 9, 9) });

    state.isCamperCombatAction = true;
    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);
    jest.spyOn(action, "reset");

    action.onHit(object, 10, ZERO_VECTOR, enemy);

    expect(state.lastSeenEnemyAtPosition).toEqual(MockVector.create(9, 9, 9));
    expect(action.reset).toHaveBeenCalledTimes(1);
  });
});
