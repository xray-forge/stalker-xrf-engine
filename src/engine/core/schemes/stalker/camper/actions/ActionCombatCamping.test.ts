import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { danger_object, stalker_ids, time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { createVector, isObjectAtTerminalWaypoint, ZERO_VECTOR } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockDangerObject, MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { StalkerPatrolController } from "@/engine/core/ai/patrol";
import { StalkerStateController } from "@/engine/core/ai/state";
import { EStalkerState, IPatrolSuggestedState } from "@/engine/core/animation/types";
import { getManager, IRegistryObjectState, registerObject } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
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

jest.mock("xray16/lib", () => ({
  ...jest.requireActual<typeof import("xray16/lib")>("xray16/lib"),
  isObjectAtTerminalWaypoint: jest.fn(),
}));

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

  it("should reset patrols and sniper scan settings for the selected combat mode", () => {
    const [action, object, state, schemeState] = createAction();

    schemeState.pathLook = "test-wp-2";
    schemeState.pathWalk = "test-wp";
    schemeState.sniper = false;
    schemeState.suggestedState = {} as IPatrolSuggestedState;
    jest.spyOn(action.patrolController, "reset").mockImplementation(() => {});
    replaceFunctionMock(object.sniper_update_rate, () => true);

    action.reset();

    expect(action.patrolController.reset).toHaveBeenCalledWith(
      "test-wp",
      expect.any(LuaTable),
      "test-wp-2",
      expect.any(LuaTable),
      null,
      schemeState.suggestedState,
      expect.any(Object)
    );
    expect(object.sniper_update_rate).toHaveBeenCalledWith(false);
    expect(schemeState.signals).toEqualLuaTables({});
    expect(schemeState.scanTable).toEqualLuaTables({});
    expect(state.stateController?.setState).toHaveBeenCalledWith(EStalkerState.PATROL, null, null, null, null);
  });

  it("should fire at a visible enemy when the configured shooting mode permits it", () => {
    const [action, object, state, schemeState] = createAction();
    const enemy: GameObject = MockGameObject.mock({ id: 100 });

    schemeState.attackSound = "attack";
    schemeState.shoot = "always";
    schemeState.sniper = false;
    schemeState.suggestedState = {} as IPatrolSuggestedState;
    jest.spyOn(object, "best_enemy").mockReturnValue(enemy);
    jest.spyOn(object, "see").mockReturnValue(true);
    jest.spyOn(state.stateController!, "setState").mockImplementation(() => {});
    jest.spyOn(getManager(SoundManager), "play").mockImplementation(() => null);

    action.execute();

    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE_FIRE,
      null,
      null,
      { lookObjectId: enemy.id(), lookPosition: enemy.position() },
      { animation: true }
    );
  });

  it("should respect always, none, and terminal shooting modes", () => {
    const [action] = createAction();

    action.state.shoot = "always";
    expect(action.canShoot()).toBe(true);

    action.state.shoot = "none";
    expect(action.canShoot()).toBe(false);

    action.state.shoot = "terminal";
    replaceFunctionMock(isObjectAtTerminalWaypoint, () => [true, 0]);
    expect(action.canShoot()).toBe(true);

    replaceFunctionMock(isObjectAtTerminalWaypoint, () => [false, 0]);
    expect(action.canShoot()).toBe(false);
  });

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

  it("should interpolate scan points over the configured scan interval", () => {
    const [action, , state, schemeState] = createAction();

    schemeState.scandelta = 2;
    schemeState.suggestedState = {} as IPatrolSuggestedState;
    schemeState.timeScanDelta = 1_000;
    schemeState.scanTable.set(
      1,
      $fromArray([
        { key: 0, pos: ZERO_VECTOR },
        { key: 1, pos: createVector(2, 0, 0) },
      ])
    );
    jest.spyOn(state.stateController!, "setState").mockImplementation(() => {});
    replaceFunctionMock(time_global, () => 1_000);

    action.scan(1);

    expect(action.flag).toBe(1);
    expect(schemeState.curLookPoint).toBe(2);
    expect(schemeState.lastLookPoint).toEqual({ key: 0, pos: ZERO_VECTOR });
    expect(state.stateController?.setState).toHaveBeenCalledWith(
      EStalkerState.HIDE_NA,
      null,
      null,
      { lookPosition: ZERO_VECTOR },
      null
    );

    replaceFunctionMock(time_global, () => 2_001);
    action.scan(1);

    expect(schemeState.curLookPoint).toBeNull();
    expect(schemeState.lastLookPoint).toEqual({ key: 1, pos: createVector(2, 0, 0) });
    expect(state.stateController?.setState).toHaveBeenLastCalledWith(
      EStalkerState.HIDE_NA,
      null,
      null,
      { lookPosition: createVector(2, 0, 0) },
      null
    );
  });
});
