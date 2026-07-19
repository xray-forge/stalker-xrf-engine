import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback, patrol } from "xray16";
import { EGameObjectPath, GameObject, Patrol } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { patrolConfig } from "@/engine/core/ai/patrol/PatrolConfig";
import { StalkerPatrolController } from "@/engine/core/ai/patrol/StalkerPatrolController";
import { EStalkerState, EWaypointArrivalType, IPatrolSuggestedState } from "@/engine/core/animation/types";
import { registerObject, registry } from "@/engine/core/database";
import { parseWaypointsData } from "@/engine/core/ini";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

const suggestedState: IPatrolSuggestedState = {
  standing: EStalkerState.GUARD,
  moving: EStalkerState.PATROL,
  movingFire: null,
  campering: null,
  camperingFire: null,
};

function mockController(): [StalkerPatrolController, GameObject] {
  const object: GameObject = MockGameObject.mock();

  registerObject(object);

  return [new StalkerPatrolController(object), object];
}

describe("StalkerPatrolController", () => {
  beforeEach(() => {
    resetRegistry();
    patrolConfig.PATROL_TEAMS.delete("first-team");
    patrolConfig.PATROL_TEAMS.delete("second-team");
  });

  it("registers the binder-lifetime waypoint callback when initialized", () => {
    const [controller, object] = mockController();

    expect(controller.initialize()).toBe(controller);
    expect(object.set_callback).toHaveBeenCalledWith(
      callback.patrol_path_in_point,
      controller.onWalkWaypoint,
      controller
    );
  });

  it("releases the current team and returns to level paths when finalized", () => {
    const [controller, object] = mockController();

    controller.team = "first-team";
    patrolConfig.PATROL_TEAMS.set("first-team", new LuaTable());
    patrolConfig.PATROL_TEAMS.get("first-team").set(object.id(), true);

    controller.finalize();

    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(patrolConfig.PATROL_TEAMS.get("first-team")).toEqualLuaTables({});
  });

  it("resets synchronization membership and selects fresh suggested states", () => {
    const [controller, object] = mockController();
    const walkWaypoints = parseWaypointsData("test-wp");

    controller.reset("test-wp", walkWaypoints, null, null, "first-team", suggestedState);
    patrolConfig.PATROL_TEAMS.get("first-team").set(object.id(), true);

    controller.reset("test-wp", walkWaypoints, null, null, "first-team", {
      ...suggestedState,
      standing: EStalkerState.SIT,
      moving: EStalkerState.SNEAK,
    });

    expect(patrolConfig.PATROL_TEAMS.get("first-team").get(object.id())).toBe(false);
    expect(controller.currentStateStanding).toBe(EStalkerState.SIT);
    expect(controller.currentStateMoving).toBe(EStalkerState.SNEAK);

    controller.reset("test-wp", walkWaypoints, null, null, "second-team", suggestedState);

    expect(patrolConfig.PATROL_TEAMS.get("first-team").get(object.id())).toBeNull();
    expect(patrolConfig.PATROL_TEAMS.get("second-team").get(object.id())).toBe(false);
  });

  it("continues from patrol point zero instead of choosing the nearest point", () => {
    const [controller, object] = mockController();

    controller.patrolWalk = new patrol("test-wp");
    controller.patrolWalkName = "test-wp";
    controller.currentPointIndex = 0;
    controller.currentStateMoving = EStalkerState.PATROL;

    controller.setup();

    expect(object.set_start_point).toHaveBeenCalledWith(0);
    expect(object.set_patrol_path).toHaveBeenCalledWith("test-wp", patrol.next, patrol.continue, true);
  });

  it("updates its moving state after the current point becomes available", () => {
    const [controller, object] = mockController();

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);
    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0);

    controller.patrolWalk = new patrol("test-wp");
    controller.currentPointIndex = 0;
    controller.canUseGetCurrentPointIndex = true;
    controller.keepStateUntil = 0;
    controller.walkUntil = 0;
    controller.runUntil = 0;
    controller.defaultStateMoving1 = parseWaypointsData("test-wp").get(0).a!;

    controller.update();

    expect(controller.keepStateUntil).toBe(10_000 + patrolConfig.KEEP_STATE_DURATION);
    expect(controller.currentStateMoving).toBe(EStalkerState.PATROL);
  });

  it("emits a synchronization signal after every living team member is ready", () => {
    const [controller, object] = mockController();
    const state = registry.objects.get(object.id());
    const schemeState = mockSchemeState(EScheme.WALKER);

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    schemeState.signals = new LuaTable();
    state.activeScheme = EScheme.WALKER;
    state[EScheme.WALKER] = schemeState;
    controller.team = "first-team";
    controller.synchronizationSignal = "team-ready";
    controller.synchronizationSignalTimeout = 0;
    patrolConfig.PATROL_TEAMS.set("first-team", new LuaTable());
    patrolConfig.PATROL_TEAMS.get("first-team").set(object.id(), true);

    controller.update();

    expect(schemeState.signals.get("team-ready")).toBe(true);
    expect(controller.synchronizationSignal).toBeNull();
  });

  it("handles terminal waypoint zero after an animation ends", () => {
    const [controller, object] = mockController();

    registry.objects.get(object.id()).activeScheme = EScheme.WALKER;
    controller.patrolWalk = new patrol("test-wp-single");
    controller.patrolLookWaypoints = parseWaypointsData("test-wp");
    controller.lastLookPointIndex = 0;
    controller.lastWalkPointIndex = 0;

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0);

    const onWalkWaypoint = jest.spyOn(controller, "onWalkWaypoint").mockImplementation(jest.fn());

    controller.onAnimationEnd();

    expect(onWalkWaypoint).toHaveBeenCalledWith(object, null, 0);
  });

  it("processes a zero return value after animation turn", () => {
    const [controller] = mockController();
    const callbackHandler = jest.fn(() => true);

    controller.patrolLook = new patrol("test-wp");
    controller.patrolLookWaypoints = parseWaypointsData("test-wp");
    controller.lastLookPointIndex = 0;
    controller.lastWalkPointIndex = 0;
    controller.currentStateStanding = EStalkerState.GUARD;
    controller.retvalAfterRotation = 0;
    controller.patrolCallbackDescriptor = { context: {}, callback: callbackHandler };

    controller.onAnimationTurnEnd();

    expect(callbackHandler).toHaveBeenCalledWith(EWaypointArrivalType.AFTER_ANIMATION_TURN, 0, 0);
  });

  it("processes walk waypoint callbacks before continuing movement", () => {
    const [controller, object] = mockController();
    const callbackHandler = jest.fn(() => true);
    const walkWaypoints = parseWaypointsData("test-wp");

    walkWaypoints.get(1).ret = "3";
    controller.patrolWalkName = "test-wp";
    controller.patrolWalkWaypoints = walkWaypoints;
    controller.patrolCallbackDescriptor = { context: {}, callback: callbackHandler };

    controller.onWalkWaypoint(object, null, 1);

    expect(controller.lastWalkPointIndex).toBe(1);
    expect(callbackHandler).toHaveBeenCalledWith(EWaypointArrivalType.BEFORE_ANIMATION_TURN, 3, 1);
  });

  it("selects a matching look waypoint and starts its standing state", () => {
    const [controller, object] = mockController();

    controller.patrolLook = new patrol("test-wp");
    controller.patrolLookWaypoints = parseWaypointsData("test-wp");
    controller.defaultStateStanding = parseWaypointsData("test-wp").get(0).a!;

    const update = jest.spyOn(controller, "update").mockImplementation(jest.fn());

    controller.onLookWaypoint(object, null, 0, (new patrol("test-wp") as Patrol).flags(0));

    expect(controller.lastLookPointIndex).toBe(0);
    expect(controller.currentStateStanding).toBe(EStalkerState.PATROL);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("stores the current patrol point when extrapolation starts", () => {
    const [controller, object] = mockController();

    jest.spyOn(Date, "now").mockImplementation(() => 4125);
    jest.spyOn(object, "get_current_point_index").mockImplementation(() => 3);

    controller.onExtrapolate(object, 10);

    expect(controller.canUseGetCurrentPointIndex).toBe(true);
    expect(controller.currentPointInitAt).toBe(4125);
    expect(controller.currentPointIndex).toBe(3);
  });
});
