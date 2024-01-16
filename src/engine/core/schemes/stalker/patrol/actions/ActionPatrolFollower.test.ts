import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemePatrolState, PatrolManager } from "@/engine/core/schemes/stalker/patrol";
import { ActionPatrolFollower } from "@/engine/core/schemes/stalker/patrol/actions/ActionPatrolFollower";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { EGameObjectPath, EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage, MockVector } from "@/fixtures/xray";

describe("ActionPatrolFollower", () => {
  beforeEach(() => {
    resetRegistry();

    jest.spyOn(Date, "now").mockImplementation(() => 5_000);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(action.nextUpdateAt).toBe(6_000);
    expect(action.patrolManager).toBe(objectState.patrolManager);

    expect(object.set_desired_position).toHaveBeenCalled();
    expect(object.set_desired_direction).toHaveBeenCalled();
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

    jest.spyOn(objectState.patrolManager, "reset").mockImplementation(jest.fn());

    state.pathWalk = "test-wp";
    state.pathLook = "test-wp-2";

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();
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
  });

  it("should correctly finalize", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

    jest.spyOn(objectState.patrolManager, "finalize").mockImplementation(jest.fn());

    state.pathWalk = "test-wp";

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    jest.spyOn(object, "alive").mockImplementation(() => false);
    action.finalize();

    expect(objectState.patrolManager.finalize).toHaveBeenCalledTimes(0);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    action.finalize();

    expect(objectState.patrolManager.finalize).toHaveBeenCalledTimes(1);
  });

  it("should correctly deactivate", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

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
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

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
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

    state.pathWalk = "test-wp";
    state.patrolManager = new PatrolManager("test-wp-key");

    jest.spyOn(state.patrolManager, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.onSwitchOffline(object);

    expect(state.patrolManager.unregisterObject).toHaveBeenCalledTimes(1);
    expect(state.patrolManager.unregisterObject).toHaveBeenCalledWith(object);
  });

  it("should correctly handle waypoint processing", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

    action.setup(object, MockPropertyStorage.mock());
    expect(() => action.onProcessWaypoint()).not.toThrow();
  });

  it("should correctly execute", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);

    objectState.patrolManager = new StalkerPatrolManager(object);
    objectState.stateManager = new StalkerStateManager(object);

    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);
    const action: ActionPatrolFollower = new ActionPatrolFollower(state, object);

    state.patrolManager = new PatrolManager("test-wp-patrol");
    state.pathWalk = "test-wp";
    state.pathLook = "test-wp-2";

    state.patrolManager.registerObject(MockGameObject.mock());
    state.patrolManager.registerObject(object);

    action.setup(object, MockPropertyStorage.mock());

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);
    jest.spyOn(objectState.stateManager, "setState").mockImplementation(() => {});

    action.execute();

    expect(action.nextUpdateAt).toBe(11_000);

    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_path_type).toHaveBeenCalledTimes(1);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledTimes(1);

    expect(object.set_desired_direction).toHaveBeenCalledWith(
      MockVector.mock(0.7071067811865475, 0, 0.7071067811865475)
    );

    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(-1);
    expect(objectState.stateManager.setState).toHaveBeenCalledWith(EStalkerState.RUSH, null, null, null, null);

    action.execute();

    expect(action.nextUpdateAt).toBe(11_000);

    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_path_type).toHaveBeenCalledTimes(1);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledTimes(1);
  });
});
