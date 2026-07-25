import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { StalkerPatrolController } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject, setStalkerState } from "@/engine/core/database";
import { parseWaypointsDataFromList } from "@/engine/core/ini";
import { ActionSleeperActivity } from "@/engine/core/schemes/stalker/sleeper/actions/ActionSleeperActivity";
import { ESleeperState, ISchemeSleeperState } from "@/engine/core/schemes/stalker/sleeper/sleeper_types";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({ setStalkerState: jest.fn() }));

function createAction(base: Partial<ISchemeSleeperState> = {}): {
  action: ActionSleeperActivity;
  object: GameObject;
  registryState: IRegistryObjectState;
  state: ISchemeSleeperState;
} {
  const object: GameObject = MockGameObject.mock();
  const registryState: IRegistryObjectState = registerObject(object);
  const state: ISchemeSleeperState = mockSchemeState<ISchemeSleeperState>(EScheme.SLEEPER, {
    pathMain: "test-wp-double",
    wakeable: false,
    ...base,
  });

  registryState.patrolController = new StalkerPatrolController(object);

  const action: ActionSleeperActivity = new ActionSleeperActivity(state, object);

  action.setup(object, MockPropertyStorage.mock());

  jest.spyOn(action.patrolController, "reset").mockImplementation(() => action.patrolController);
  jest.spyOn(action.patrolController, "update").mockImplementation(() => action.patrolController);
  jest.spyOn(action.patrolController, "finalize").mockImplementation(() => action.patrolController);

  return { action, object, registryState, state };
}

describe("ActionSleeperActivity", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
  });

  it("should correctly initialize", () => {
    const { action, object, registryState } = createAction();

    expect(action.patrolController).toBe(registryState.patrolController);
    expect(action.wasReset).toBe(false);
    expect(action.sleepingState).toBe(ESleeperState.WALKING);

    action.initialize();

    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(action.wasReset).toBe(true);
    expect(action.patrolController.reset).toHaveBeenCalledTimes(1);
  });

  it("should build walk and look paths for a two point main path", () => {
    const { action, state } = createAction({ pathMain: "test-wp-double" });

    action.reset();

    expect(state.pathWalk).toBe("test-wp-double");
    expect(state.pathLook).toBe("test-wp-double");
    expect(state.pathWalkInfo).toEqualLuaTables(
      parseWaypointsDataFromList("test-wp-double", 2, [1, "wp00"], [0, "wp01"])
    );
    expect(state.pathLookInfo).toEqualLuaTables(
      parseWaypointsDataFromList("test-wp-double", 2, [0, "wp00"], [1, "wp01|ret=1"])
    );
    expect(state.signals).toEqualLuaTables({});
    expect(action.timer).toEqual({ begin: null, idle: null, maxidle: 10, sumidle: 20, random: 50 });
  });

  it("should build only walk path for a single point main path", () => {
    const { action, state } = createAction({ pathMain: "test-wp-single" });

    action.reset();

    expect(state.pathWalk).toBe("test-wp-single");
    expect(state.pathWalkInfo).toEqualLuaTables(parseWaypointsDataFromList("test-wp-single", 1, [0, "wp00|ret=1"]));
    expect(state.pathLook).toBeNull();
    expect(state.pathLookInfo).toBeNull();
  });

  it("should fail for main path with unexpected waypoint count", () => {
    const { action } = createAction({ pathMain: "test-wp" });

    expect(() => action.reset()).toThrow("contains 3 waypoints, while 1 or 2 were expected");
  });

  it("should keep already parsed walk path info", () => {
    const parsed = parseWaypointsDataFromList("test-wp-single", 1, [0, "wp00|ret=1"]);
    const { action, state } = createAction({
      pathLook: "look-path",
      pathWalk: "walk-path",
      pathWalkInfo: parsed,
    });

    action.reset();

    expect(state.pathWalk).toBe("walk-path");
    expect(state.pathWalkInfo).toBe(parsed);
    expect(action.patrolController.reset).toHaveBeenCalledTimes(1);
  });

  it("should reset on execute when activation happened", () => {
    const { action } = createAction();

    action.initialize();
    action.activate();

    expect(action.wasReset).toBe(false);

    action.execute();

    expect(action.wasReset).toBe(true);
  });

  it("should update patrol while walking", () => {
    const { action } = createAction();

    action.initialize();
    action.execute();

    expect(action.patrolController.update).toHaveBeenCalledTimes(1);
  });

  it("should not update patrol while sleeping", () => {
    const { action } = createAction();

    action.initialize();
    action.sleepingState = ESleeperState.SLEEPING;
    action.execute();

    expect(action.patrolController.update).not.toHaveBeenCalled();
  });

  it("should finalize patrol controller", () => {
    const { action } = createAction();

    action.initialize();
    action.finalize();

    expect(action.patrolController.finalize).toHaveBeenCalledTimes(1);
  });

  it("should start sleeping on patrol callback", () => {
    const { action, object } = createAction({ pathMain: "test-wp-double" });

    expect(action.onPatrolCallback()).toBe(true);
    expect(action.sleepingState).toBe(ESleeperState.SLEEPING);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.SLEEP, null, null, {
      lookPosition: expect.anything(),
    });
  });

  it("should start sitting on patrol callback for wakeable object", () => {
    const { action, object } = createAction({ pathMain: "test-wp-single", wakeable: true });

    expect(action.onPatrolCallback()).toBe(true);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.SIT, null, null, { lookPosition: null });
  });
});
