import { describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterMoveManager } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveManager";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockCHelicopter, MockGameObject, MockPatrol } from "@/fixtures/xray";

describe("HelicopterMoveManager", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    expect(manager.helicopter).toBeInstanceOf(CHelicopter);

    expect(manager.helicopterFireManager).toBeInstanceOf(HelicopterFireManager);
    expect(manager.helicopterFlyManager).toBeInstanceOf(HelicopterFlyManager);

    expect(manager.isHelicopterMoving).toBe(false);
    expect(manager.isWaypointCallbackHandled).toBe(false);

    expect(manager.patrolMove).toBeNull();
    expect(manager.patrolMoveInfo).toBeNull();
    expect(manager.patrolLook).toBeNull();

    expect(manager.lastIndex).toBeNull();
    expect(manager.nextIndex).toBeNull();
    expect(manager.maxVelocity).toBeUndefined();
    expect(manager.flagToWpCallback).toBeNull();
    expect(manager.byStopFireFly).toBeNull();
    expect(manager.stopPoint).toBeNull();
  });

  it.todo("should correctly activate");

  it.todo("should correctly handle save/load");

  it.todo("should correctly handle update");

  it.todo("should correctly handle update movement state");

  it("should correctly handle update look state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    jest.spyOn(manager.helicopterFlyManager, "setBlockFlook").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFlyManager, "lookAtPosition").mockImplementation(jest.fn());

    manager.updateLookState();

    expect(manager.helicopterFlyManager.setBlockFlook).toHaveBeenCalledTimes(1);
    expect(manager.helicopterFlyManager.setBlockFlook).toHaveBeenCalledWith(true);
    expect(manager.helicopterFlyManager.lookAtPosition).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle waypoint callback with generic index", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    expect(manager.isWaypointCallbackHandled).toBe(false);
    expect(manager.lastIndex).toBeNull();

    manager.onWaypoint(object, "action-type", 10);

    expect(manager.isWaypointCallbackHandled).toBe(true);
    expect(manager.lastIndex).toBeNull();

    manager.patrolMove = MockPatrol.mock("test-wp");

    manager.flagToWpCallback = true;
    manager.onWaypoint(object, "action-type", 10);

    expect(manager.isWaypointCallbackHandled).toBe(true);
    expect(manager.lastIndex).toBeNull();

    manager.flagToWpCallback = false;
    manager.onWaypoint(object, "action-type", 10);

    expect(manager.isWaypointCallbackHandled).toBe(true);
    expect(manager.lastIndex).toBe(10);
  });

  it("should correctly handle waypoint callback with reset index", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    manager.state.signals = new LuaTable();
    manager.lastIndex = 1;
    manager.nextIndex = 2;
    manager.patrolMove = MockPatrol.mock("test-wp-sig");
    manager.patrolMoveInfo = parseWaypointsData("test-wp-sig");

    manager.flagToWpCallback = true;
    manager.onWaypoint(object, "action-type", -1);

    expect(manager.isWaypointCallbackHandled).toBe(true);
    expect(manager.state.signals).toEqualLuaTables({});
    expect(manager.lastIndex).toBe(1);

    manager.flagToWpCallback = false;
    manager.onWaypoint(object, "action-type", -1);

    expect(manager.isWaypointCallbackHandled).toBe(true);
    expect(manager.state.signals).toEqualLuaTables({ b: true });
    expect(manager.lastIndex).toBe(2);
  });
});
