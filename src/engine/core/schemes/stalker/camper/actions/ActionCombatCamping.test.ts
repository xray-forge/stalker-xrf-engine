import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { danger_object, stalker_ids, time_global } from "xray16";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStalkerState, IPatrolSuggestedState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper";
import { ActionCombatCamping } from "@/engine/core/schemes/stalker/camper/actions/ActionCombatCamping";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { DangerObject, EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockDangerObject, MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

function createAction(): [ActionCombatCamping, GameObject, IRegistryObjectState, ISchemeCamperState] {
  const object: GameObject = MockGameObject.mock();
  const state: IRegistryObjectState = registerObject(object);
  const schemeState: ISchemeCamperState = mockSchemeState(EScheme.COMBAT_CAMPER);

  state.patrolManager = new StalkerPatrolManager(object);
  state.stateManager = new StalkerStateManager(object);

  jest.spyOn(state.stateManager, "setState").mockImplementation(jest.fn());

  const action: ActionCombatCamping = new ActionCombatCamping(schemeState, object);

  action.setup(object, MockPropertyStorage.mock());

  return [action, object, state, schemeState];
}

jest.mock("@/engine/core/schemes/stalker/danger/utils");

describe("ActionCloseCombat", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly create", () => {
    const [action, , state, schemeState] = createAction();

    expect(action.state).toBe(schemeState);
    expect(action.patrolManager).toBe(state.patrolManager);
    expect(schemeState.scanTable).toEqualLuaTables({});
  });

  it("should correctly initialize", () => {
    const [action, object] = createAction();

    jest.spyOn(action, "reset").mockImplementation(jest.fn());
    action.enemyPosition = ZERO_VECTOR;

    action.initialize();

    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(action.reset).toHaveBeenCalledTimes(1);
    expect(action.enemyPosition).toBeNull();
  });

  it("should correctly destroy", () => {
    const [action] = createAction();

    jest.spyOn(action.patrolManager, "finalize").mockImplementation(jest.fn());

    action.finalize();

    expect(action.patrolManager.finalize).toHaveBeenCalledTimes(1);
  });

  it("should correctly activate", () => {
    const [action] = createAction();

    jest.spyOn(action, "reset").mockImplementation(jest.fn());

    action.activate();

    expect(action.reset).toHaveBeenCalledTimes(1);
  });

  it.todo("should correctly reset");

  it.todo("should correctly handle action execution");

  it.todo("should correctly check if can shoot");

  it("should correctly process danger", () => {
    const [action, object, state, schemeState] = createAction();
    const danger: MockDangerObject = MockDangerObject.create();

    action.state.suggestedState = {} as IPatrolSuggestedState;

    replaceFunctionMock(isObjectFacingDanger, () => false);

    expect(action.processDanger()).toBe(false);

    replaceFunctionMock(isObjectFacingDanger, () => true);
    jest.spyOn(object, "best_danger").mockImplementation(() => null);

    expect(action.processDanger()).toBe(false);
    expect(object.play_sound).not.toHaveBeenCalled();
    expect(state.stateManager?.setState).not.toHaveBeenCalled();

    replaceFunctionMock(isObjectFacingDanger, () => true);
    jest.spyOn(object, "best_danger").mockImplementation(() => danger.asMock());

    expect(action.processDanger()).toBe(true);
    expect(object.play_sound).toHaveBeenCalledWith(stalker_ids.sound_alarm, 1, 0, 1, 0);
    expect(state.stateManager?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE,
      null,
      null,
      { lookPosition: { x: 1.5, y: -0.5, z: 1 } },
      null
    );

    schemeState.sniper = true;

    expect(action.processDanger()).toBe(true);
    expect(object.play_sound).toHaveBeenCalledWith(stalker_ids.sound_alarm, 1, 0, 1, 0);
    expect(state.stateManager?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE_NA,
      null,
      null,
      { lookPosition: { x: 1.5, y: -0.5, z: 1 } },
      null
    );

    danger.dangerType = danger_object.attacked;
    schemeState.suggestedState.camperingFire = EStalkerState.ASSAULT;

    expect(action.processDanger()).toBe(true);
    expect(state.stateManager?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE,
      null,
      null,
      { lookPosition: { x: 1.5, y: -0.5, z: 1 } },
      null
    );

    jest.spyOn(danger, "time").mockImplementation(() => time_global());

    expect(action.processDanger()).toBe(true);
    expect(state.stateManager?.setState).toHaveBeenCalledWith(
      EStalkerState.ASSAULT,
      null,
      null,
      { lookPosition: { x: 0.25, y: 0.25, z: 0.25 } },
      null
    );

    schemeState.suggestedState.camperingFire = null;

    expect(action.processDanger()).toBe(true);
    expect(state.stateManager?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE_FIRE,
      null,
      null,
      { lookPosition: { x: 0.25, y: 0.25, z: 0.25 } },

      null
    );
  });

  it.todo("should correctly scan");
});
