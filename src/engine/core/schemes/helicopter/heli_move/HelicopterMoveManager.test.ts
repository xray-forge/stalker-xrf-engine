import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter, patrol } from "xray16";

import { registerObject, setPortableStoreValue } from "@/engine/core/database";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterMoveManager } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveManager";
import { SchemeHelicopterMove } from "@/engine/core/schemes/helicopter/heli_move/SchemeHelicopterMove";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { createVector } from "@/engine/core/utils/vector";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockCHelicopter, MockGameObject, MockIniFile, MockPatrol } from "@/fixtures/xray";

describe("HelicopterMoveManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

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

  it("should correctly activate when not loading", () => {
    loadSchemeImplementation(SchemeHelicopterMove);

    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    registerObject(object);

    const state: ISchemeHelicopterMoveState = SchemeHelicopterMove.activate(
      object,
      MockIniFile.mock("test.ltx", {
        "heli_move@test": {
          path_move: "test-wp",
          path_look: "test-wp-2",
          max_velocity: 5000,
          fire_point: "test-wp-3",
          fire_trail: true,
          min_mgun_attack_dist: 3,
          max_mgun_attack_dist: 4,
          min_rocket_attack_dist: 5,
          max_rocket_attack_dist: 6,
          use_mgun: true,
          use_rocket: true,
          upd_vis: 30,
        },
      }),
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    jest.spyOn(manager, "updateMovementState").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFlyManager, "setLookPoint").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFireManager, "updateEnemyState").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFireManager, "removeHelicopterFightUI").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFireManager, "removeHelicopterFightUI").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFireManager, "updateEnemyState").mockImplementation(jest.fn());

    manager.activate(object, false);

    expect(state.signals).toEqualLuaTables({});

    expect(manager.patrolMove).toBeInstanceOf(patrol);
    expect(manager.patrolMoveInfo).toEqualLuaTables(parseWaypointsData("test-wp"));
    expect(manager.helicopterFlyManager.setLookPoint).toHaveBeenCalledWith(createVector(4, 2, 1));
    expect(manager.patrolLook).toBeInstanceOf(patrol);
    expect(manager.maxVelocity).toBe(5000);

    expect(manager.lastIndex).toBeNull();
    expect(manager.nextIndex).toBeNull();

    expect(manager.helicopterFlyManager.maxVelocity).toBe(5000);
    expect(manager.helicopterFlyManager.heliLAccFW).toBeCloseTo(333.333);
    expect(manager.helicopterFlyManager.heliLAccBW).toBeCloseTo(222.222);

    expect(helicopter.SetLinearAcc).toHaveBeenCalledWith(
      manager.helicopterFlyManager.heliLAccFW,
      manager.helicopterFlyManager.heliLAccBW
    );
    expect(helicopter.SetMaxVelocity).toHaveBeenCalledWith(5000);

    expect(manager.isHelicopterMoving).toBe(false);
    expect(manager.stopPoint).toBeNull();
    expect(manager.byStopFireFly).toBe(false);

    expect(manager.isWaypointCallbackHandled).toBe(false);
    expect(manager.flagToWpCallback).toBe(false);
    expect(manager.helicopterFireManager.enemyPreference).toBeNull();
    expect(manager.helicopterFireManager.enemy).toBeNull();
    expect(manager.helicopterFireManager.flagByEnemy).toBe(true);

    expect(manager.helicopterFireManager.firePoint).toEqual(createVector(3, 2, 1));
    expect(helicopter.m_min_mgun_dist).toBe(3);
    expect(helicopter.m_max_mgun_dist).toBe(4);
    expect(helicopter.m_min_rocket_dist).toBe(5);
    expect(helicopter.m_max_rocket_dist).toBe(6);
    expect(helicopter.m_use_mgun_on_attack).toBe(true);
    expect(helicopter.m_use_rocket_on_attack).toBe(true);

    expect(manager.helicopterFireManager.updateVisibility).toBe(30);
    expect(manager.helicopterFireManager.updateEnemyState).toHaveBeenCalledTimes(1);
    expect(manager.updateMovementState).toHaveBeenCalledTimes(1);
    expect(helicopter.UseFireTrail).toHaveBeenCalledWith(true);

    expect(manager.helicopterFireManager.showHealth).toBe(false);
    expect(manager.helicopterFireManager.removeHelicopterFightUI).toHaveBeenCalledTimes(1);
  });

  it("should correctly activate when not loading and enabled health show", () => {
    loadSchemeImplementation(SchemeHelicopterMove);

    const { actorGameObject } = mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    registerObject(object);

    const state: ISchemeHelicopterMoveState = SchemeHelicopterMove.activate(
      object,
      MockIniFile.mock("test.ltx", {
        "heli_move@test": {
          max_velocity: 1000,
          path_move: "test-wp",
          path_look: "actor",
          show_health: true,
        },
      }),
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    jest.spyOn(manager.helicopterFlyManager, "setLookPoint").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFireManager, "removeHelicopterFightUI").mockImplementation(jest.fn());
    jest.spyOn(manager.helicopterFireManager, "showHelicopterFightUI").mockImplementation(jest.fn());

    manager.activate(object, false);

    expect(manager.helicopterFlyManager.setLookPoint).toHaveBeenCalledWith(actorGameObject.position());

    expect(manager.helicopterFireManager.showHealth).toBe(true);
    expect(manager.helicopterFireManager.removeHelicopterFightUI).toHaveBeenCalledTimes(1);
    expect(manager.helicopterFireManager.showHelicopterFightUI).toHaveBeenCalledTimes(1);
  });

  it("should correctly activate when loading", () => {
    loadSchemeImplementation(SchemeHelicopterMove);

    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    registerObject(object);

    setPortableStoreValue(object.id(), "st", true);
    setPortableStoreValue(object.id(), "li", 1);
    setPortableStoreValue(object.id(), "ni", 2);
    setPortableStoreValue(object.id(), "wc", true);

    const state: ISchemeHelicopterMoveState = SchemeHelicopterMove.activate(
      object,
      MockIniFile.mock("test.ltx", {
        "heli_move@test": {
          path_move: "test-wp",
          max_velocity: 4000,
          engine_sound: "true",
        },
      }),
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    manager.activate(object, true);

    expect(state.signals).toEqualLuaTables({});

    expect(manager.patrolMove).toBeInstanceOf(patrol);
    expect(manager.patrolMoveInfo).toEqualLuaTables(parseWaypointsData("test-wp"));
    expect(manager.patrolLook).toBeNull();
    expect(manager.maxVelocity).toBe(4000);

    expect(manager.isHelicopterMoving).toBe(true);
    expect(manager.lastIndex).toBe(1);
    expect(manager.nextIndex).toBe(2);
    expect(manager.isWaypointCallbackHandled).toBe(true);

    expect(helicopter.TurnEngineSound).toHaveBeenCalledWith(true);
  });

  it.todo("should correctly handle save/load");

  it.todo("should correctly handle update");

  it("should correctly handle update movement state without move patrol", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    manager.byStopFireFly = true;
    jest.spyOn(manager.helicopterFlyManager, "flyOnPointWithVector").mockImplementation(jest.fn(() => false));

    manager.updateMovementState();

    expect(manager.lastIndex).toBeNull();
    expect(manager.nextIndex).toBeNull();
  });

  it.todo("should correctly handle update movement state with move patrol");

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
