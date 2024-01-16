import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EPatrolFormation, StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStalkerState, EWaypointArrivalType } from "@/engine/core/animation/types";
import { getManager, IRegistryObjectState, registerObject } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemePatrolState, PatrolManager } from "@/engine/core/schemes/stalker/patrol";
import { ActionPatrolCommander } from "@/engine/core/schemes/stalker/patrol/actions/ActionPatrolCommander";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionPatrolCommander", () => {
  beforeEach(() => {
    resetRegistry();

    jest.spyOn(Date, "now").mockImplementation(() => 5_000);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    jest.spyOn(action, "activate").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(action.previousState).toBeNull();
    expect(action.currentState).toBe(EStalkerState.PATROL);
    expect(action.activate).toHaveBeenCalledTimes(1);

    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    state.pathWalk = "test-wp";
    state.pathLook = "test-wp-2";
    state.patrolManager = new PatrolManager("test-name");

    jest.spyOn(objectState.patrolManager, "reset").mockImplementation(jest.fn());
    jest.spyOn(state.patrolManager, "setCommanderState").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.activate();

    expect(state.signals).toEqualLuaTables({});
    expect(state.pathWalkInfo).toEqualLuaTables(parseWaypointsData(state.pathWalk));
    expect(state.pathLookInfo).toEqualLuaTables(parseWaypointsData(state.pathLook));
    expect(objectState.patrolManager.reset).toHaveBeenCalledWith(
      state.pathWalk,
      state.pathWalkInfo,
      state.pathLook,
      state.pathLookInfo,
      state.team,
      state.suggestedState,
      { context: action, callback: action.onProcessWaypoint }
    );

    expect(state.patrolManager.setCommanderState).toHaveBeenCalledWith(object, action.currentState, state.formation);
  });

  it("should correctly finalize", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    state.pathWalk = "test-wp";
    state.patrolManager = new PatrolManager("test-name");

    jest.spyOn(objectState.patrolManager, "finalize").mockImplementation(jest.fn());
    jest.spyOn(state.patrolManager, "setCommanderState").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());

    jest.spyOn(object, "alive").mockImplementation(() => false);
    action.finalize();

    expect(objectState.patrolManager.finalize).toHaveBeenCalledTimes(0);
    expect(state.patrolManager.setCommanderState).toHaveBeenCalledTimes(0);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    action.finalize();

    expect(objectState.patrolManager.finalize).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.setCommanderState).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.setCommanderState).toHaveBeenCalledWith(object, EStalkerState.GUARD, state.formation);
  });

  it("should correctly deactivate", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    state.pathWalk = "test-wp";
    state.patrolManager = new PatrolManager("test-wp-key");

    jest.spyOn(state.patrolManager, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.deactivate(object);

    expect(state.patrolManager.unregisterObject).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.unregisterObject).toHaveBeenCalledWith(object);
  });

  it("should correctly handle death event", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    state.pathWalk = "test-wp";
    state.patrolManager = new PatrolManager("test-wp-key");

    jest.spyOn(state.patrolManager, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.onDeath(object);

    expect(state.patrolManager.unregisterObject).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.unregisterObject).toHaveBeenCalledWith(object);
  });

  it("should correctly handle switch offline", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    state.pathWalk = "test-wp";
    state.patrolManager = new PatrolManager("test-wp-key");

    jest.spyOn(state.patrolManager, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.onSwitchOffline(object);

    expect(state.patrolManager.unregisterObject).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.unregisterObject).toHaveBeenCalledWith(object);
  });

  it("should correctly handle waypoints callback", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    action.onProcessWaypoint(EWaypointArrivalType.AFTER_ANIMATION_TURN, 0);
    expect(state.formation).toBe(EPatrolFormation.LINE);

    action.onProcessWaypoint(EWaypointArrivalType.AFTER_ANIMATION_TURN, 1);
    expect(state.formation).toBe(EPatrolFormation.AROUND);

    action.onProcessWaypoint(EWaypointArrivalType.AFTER_ANIMATION_TURN, 2);
    expect(state.formation).toBe(EPatrolFormation.BACK);
  });

  it("should correctly execute", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);
    objectState.stateManager = new StalkerStateManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolCommander = new ActionPatrolCommander(state, object);

    state.patrolManager = new PatrolManager("test-patrol");

    jest.spyOn(objectState.patrolManager, "update").mockImplementation(jest.fn());
    jest.spyOn(objectState.stateManager, "getState").mockImplementation(jest.fn(() => EStalkerState.SNEAK));
    jest.spyOn(state.patrolManager, "setCommanderState").mockImplementation(jest.fn());
    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    expect(action.previousState).toBeNull();

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.previousState).toBe(EStalkerState.SNEAK);
    expect(objectState.patrolManager.update).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.setCommanderState).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.setCommanderState).toHaveBeenCalledWith(object, EStalkerState.SNEAK, state.formation);
    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "patrol_sneak");

    jest.spyOn(objectState.stateManager, "getState").mockImplementation(jest.fn(() => EStalkerState.SNEAK_RUN));
    action.execute();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "patrol_run");

    jest.spyOn(objectState.stateManager, "getState").mockImplementation(jest.fn(() => EStalkerState.PATROL));
    action.execute();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "patrol_walk");
  });
});
