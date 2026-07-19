import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { danger_object, stalker_ids, time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { ZERO_VECTOR } from "xray16/lib";
import { MockDangerObject, MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { StalkerPatrolController } from "@/engine/core/ai/patrol";
import { StalkerStateController } from "@/engine/core/ai/state";
import { EStalkerState, IPatrolSuggestedState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper";
import { ActionCombatCamping } from "@/engine/core/schemes/stalker/camper/actions/ActionCombatCamping";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createAction(): [ActionCombatCamping, GameObject, IRegistryObjectState, ISchemeCamperState] {
  const object: GameObject = MockGameObject.mock();
  const state: IRegistryObjectState = registerObject(object);
  const schemeState: ISchemeCamperState = mockSchemeState(EScheme.COMBAT_CAMPER);

  state.patrolController = new StalkerPatrolController(object);
  state.stateController = new StalkerStateController(object);

  jest.spyOn(state.stateController, "setState").mockImplementation(jest.fn());

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
    expect(action.patrolController).toBe(state.patrolController);
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

    jest.spyOn(action.patrolController, "finalize").mockImplementation(jest.fn());

    action.finalize();

    expect(action.patrolController.finalize).toHaveBeenCalledTimes(1);
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
    expect(state.stateController?.setState).not.toHaveBeenCalled();

    replaceFunctionMock(isObjectFacingDanger, () => true);
    jest.spyOn(object, "best_danger").mockImplementation(() => danger.asMock());

    expect(action.processDanger()).toBe(true);
    expect(object.play_sound).toHaveBeenCalledWith(stalker_ids.sound_alarm, 1, 0, 1, 0);
    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE,
      null,
      null,
      { lookPosition: { x: 1.5, y: -0.5, z: 1 } },
      null
    );

    schemeState.sniper = true;

    expect(action.processDanger()).toBe(true);
    expect(object.play_sound).toHaveBeenCalledWith(stalker_ids.sound_alarm, 1, 0, 1, 0);
    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE_NA,
      null,
      null,
      { lookPosition: { x: 1.5, y: -0.5, z: 1 } },
      null
    );

    danger.dangerType = danger_object.attacked;
    schemeState.suggestedState.camperingFire = EStalkerState.ASSAULT;

    expect(action.processDanger()).toBe(true);
    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE,
      null,
      null,
      { lookPosition: { x: 1.5, y: -0.5, z: 1 } },
      null
    );

    jest.spyOn(danger, "time").mockImplementation(() => time_global());

    expect(action.processDanger()).toBe(true);
    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.ASSAULT,
      null,
      null,
      { lookPosition: { x: 0.25, y: 0.25, z: 0.25 } },
      null
    );

    schemeState.suggestedState.camperingFire = null;

    expect(action.processDanger()).toBe(true);
    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE_FIRE,
      null,
      null,
      { lookPosition: { x: 0.25, y: 0.25, z: 0.25 } },

      null
    );
  });

  it.todo("should correctly scan");
});
