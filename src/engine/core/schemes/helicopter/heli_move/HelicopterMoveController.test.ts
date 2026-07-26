import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter, patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { createVector } from "xray16/lib";
import { MockCHelicopter, MockGameObject, MockIniFile } from "xray16/mocks";

import { getPortableStoreValue, registerObject, setPortableStoreValue } from "@/engine/core/database";
import { parseWaypointsData } from "@/engine/core/ini";
import { HelicopterFireController } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyController } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterMoveController } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveController";
import { SchemeHelicopterMove } from "@/engine/core/schemes/helicopter/heli_move/SchemeHelicopterMove";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("HelicopterMoveController", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    expect(controller.helicopter).toBeInstanceOf(CHelicopter);

    expect(controller.helicopterFireController).toBeInstanceOf(HelicopterFireController);
    expect(controller.helicopterFlyController).toBeInstanceOf(HelicopterFlyController);

    expect(controller.isHelicopterMoving).toBe(false);
    expect(controller.isWaypointCallbackHandled).toBe(false);

    expect(controller.patrolMove).toBeNull();
    expect(controller.patrolMoveInfo).toBeNull();
    expect(controller.patrolLook).toBeNull();

    expect(controller.lastIndex).toBeNull();
    expect(controller.nextIndex).toBeNull();
    expect(controller.maxVelocity).toBeUndefined();
    expect(controller.flagToWpCallback).toBeNull();
    expect(controller.byStopFireFly).toBeNull();
    expect(controller.stopPoint).toBeNull();
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

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    jest.spyOn(controller, "updateMovementState").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFlyController, "setLookPoint").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFireController, "updateEnemyState").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFireController, "removeHelicopterFightUI").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFireController, "removeHelicopterFightUI").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFireController, "updateEnemyState").mockImplementation(jest.fn());

    controller.activate(object, false);

    expect(state.signals).toEqualLuaTables({});

    expect(controller.patrolMove).toBeInstanceOf(patrol);
    expect(controller.patrolMoveInfo).toEqualLuaTables(parseWaypointsData("test-wp"));
    expect(controller.helicopterFlyController.setLookPoint).toHaveBeenCalledWith(createVector(4, 2, 1));
    expect(controller.patrolLook).toBeInstanceOf(patrol);
    expect(controller.maxVelocity).toBe(5000);

    expect(controller.lastIndex).toBeNull();
    expect(controller.nextIndex).toBeNull();

    expect(controller.helicopterFlyController.maxVelocity).toBe(5000);
    expect(controller.helicopterFlyController.heliLAccFW).toBeCloseTo(333.333);
    expect(controller.helicopterFlyController.heliLAccBW).toBeCloseTo(222.222);

    expect(helicopter.SetLinearAcc).toHaveBeenCalledWith(
      controller.helicopterFlyController.heliLAccFW,
      controller.helicopterFlyController.heliLAccBW
    );
    expect(helicopter.SetMaxVelocity).toHaveBeenCalledWith(5000);

    expect(controller.isHelicopterMoving).toBe(false);
    expect(controller.stopPoint).toBeNull();
    expect(controller.byStopFireFly).toBe(false);

    expect(controller.isWaypointCallbackHandled).toBe(false);
    expect(controller.flagToWpCallback).toBe(false);
    expect(controller.helicopterFireController.enemyPreference).toBeNull();
    expect(controller.helicopterFireController.enemy).toBeNull();
    expect(controller.helicopterFireController.flagByEnemy).toBe(true);

    expect(controller.helicopterFireController.firePoint).toEqual(createVector(3, 2, 1));
    expect(helicopter.m_min_mgun_dist).toBe(3);
    expect(helicopter.m_max_mgun_dist).toBe(4);
    expect(helicopter.m_min_rocket_dist).toBe(5);
    expect(helicopter.m_max_rocket_dist).toBe(6);
    expect(helicopter.m_use_mgun_on_attack).toBe(true);
    expect(helicopter.m_use_rocket_on_attack).toBe(true);

    expect(controller.helicopterFireController.updateVisibility).toBe(30);
    expect(controller.helicopterFireController.updateEnemyState).toHaveBeenCalledTimes(1);
    expect(controller.updateMovementState).toHaveBeenCalledTimes(1);
    expect(helicopter.UseFireTrail).toHaveBeenCalledWith(true);

    expect(controller.helicopterFireController.showHealth).toBe(false);
    expect(controller.helicopterFireController.removeHelicopterFightUI).toHaveBeenCalledTimes(1);
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

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    jest.spyOn(controller.helicopterFlyController, "setLookPoint").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFireController, "removeHelicopterFightUI").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFireController, "showHelicopterFightUI").mockImplementation(jest.fn());

    controller.activate(object, false);

    expect(controller.helicopterFlyController.setLookPoint).toHaveBeenCalledWith(actorGameObject.position());

    expect(controller.helicopterFireController.showHealth).toBe(true);
    expect(controller.helicopterFireController.removeHelicopterFightUI).toHaveBeenCalledTimes(1);
    expect(controller.helicopterFireController.showHelicopterFightUI).toHaveBeenCalledTimes(1);
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

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    controller.activate(object, true);

    expect(state.signals).toEqualLuaTables({});

    expect(controller.patrolMove).toBeInstanceOf(patrol);
    expect(controller.patrolMoveInfo).toEqualLuaTables(parseWaypointsData("test-wp"));
    expect(controller.patrolLook).toBeNull();
    expect(controller.maxVelocity).toBe(4000);

    expect(controller.isHelicopterMoving).toBe(true);
    expect(controller.lastIndex).toBe(1);
    expect(controller.nextIndex).toBe(2);
    expect(controller.isWaypointCallbackHandled).toBe(true);

    expect(helicopter.TurnEngineSound).toHaveBeenCalledWith(true);
  });

  it("should correctly handle save", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    controller.isHelicopterMoving = true;
    controller.lastIndex = 5;
    controller.nextIndex = 6;
    controller.isWaypointCallbackHandled = true;

    registerObject(object);

    controller.save();

    expect(getPortableStoreValue(object.id(), "st")).toBe(true);
    expect(getPortableStoreValue(object.id(), "li")).toBe(5);
    expect(getPortableStoreValue(object.id(), "ni")).toBe(6);
    expect(getPortableStoreValue(object.id(), "wc")).toBe(true);
  });

  it("should correctly handle update when switch have look path and actor is visible", () => {
    const { actorGameObject } = mockRegisteredActor();

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
          path_look: "actor",
          stop_fire: "true",
          max_velocity: 4000,
        },
        "heli_move@another": {},
        second: {},
      }),
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    jest.spyOn(controller, "updateMovementState").mockImplementation(jest.fn());
    jest.spyOn(controller, "updateLookState").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFlyController, "setLookPoint").mockImplementation(jest.fn());
    jest.spyOn(helicopter, "isVisible").mockImplementation(jest.fn(() => true));

    controller.isWaypointCallbackHandled = true;
    controller.stopPoint = null;

    controller.update();

    expect(controller.isWaypointCallbackHandled).toBe(true);
    expect(controller.byStopFireFly).toBe(true);
    expect(controller.stopPoint).toBe(object.position());
    expect(controller.updateMovementState).toHaveBeenCalledTimes(1);
    expect(controller.updateLookState).toHaveBeenCalledTimes(1);
    expect(controller.helicopterFlyController.setLookPoint).toHaveBeenCalledWith(actorGameObject.position());
    expect(helicopter.isVisible).toHaveBeenCalledWith(actorGameObject);
  });

  it("should correctly handle update when switch have look path and actor is not visible", () => {
    const { actorGameObject } = mockRegisteredActor();

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
          path_look: "actor",
          stop_fire: "true",
          max_velocity: 4000,
        },
        "heli_move@another": {},
        second: {},
      }),
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    jest.spyOn(controller, "updateMovementState").mockImplementation(jest.fn());
    jest.spyOn(controller, "updateLookState").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFlyController, "setLookPoint").mockImplementation(jest.fn());
    jest.spyOn(helicopter, "isVisible").mockImplementation(jest.fn(() => false));

    controller.isWaypointCallbackHandled = true;
    controller.stopPoint = null;

    controller.update();

    expect(controller.isWaypointCallbackHandled).toBe(true);
    expect(controller.byStopFireFly).toBe(false);
    expect(controller.stopPoint).toBeNull();
    expect(controller.updateMovementState).toHaveBeenCalledTimes(1);
    expect(controller.updateLookState).toHaveBeenCalledTimes(1);
    expect(controller.helicopterFlyController.setLookPoint).toHaveBeenCalledWith(actorGameObject.position());
    expect(helicopter.isVisible).toHaveBeenCalledWith(actorGameObject);
  });

  it("should correctly handle update when switched section", () => {
    mockRegisteredActor();
    loadSchemeImplementation(SchemeHelicopterMove);

    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    registerObject(object);

    const state: ISchemeHelicopterMoveState = SchemeHelicopterMove.activate(
      object,
      MockIniFile.mock("test.ltx", {
        "heli_move@test": {
          on_actor_in_zone: "lx8_sr_down_ladder | mob_walker@run",
          on_info: "{+test} heli_move@another, nil",
          path_move: "test-wp",
          max_velocity: 4000,
        },
        "heli_move@another": {},
        second: {},
      }),
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    controller.update();
  });

  it("should correctly handle update movement state without move patrol", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    controller.byStopFireFly = true;
    jest.spyOn(controller.helicopterFlyController, "flyOnPointWithVector").mockImplementation(jest.fn(() => false));

    controller.updateMovementState();

    expect(controller.lastIndex).toBeNull();
    expect(controller.nextIndex).toBeNull();
  });

  it("should correctly handle update movement state with move patrol", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    controller.byStopFireFly = false;
    jest.spyOn(controller.helicopterFlyController, "flyOnPointWithVector").mockImplementation(jest.fn(() => true));

    controller.patrolMove = new patrol("test-wp-double");
    controller.lastIndex = 1;
    controller.nextIndex = 2;
    controller.maxVelocity = 2000;

    controller.updateMovementState();

    expect(controller.lastIndex).toBe(1);
    expect(controller.nextIndex).toBe(0);
    expect(controller.flagToWpCallback).toBe(true);
    expect(controller.helicopterFlyController.flyOnPointWithVector).toHaveBeenCalledWith(
      createVector(2, 2, 2),
      createVector(1, 1, 1),
      2000,
      true,
      true
    );
  });

  it("should correctly handle update look state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    jest.spyOn(controller.helicopterFlyController, "setBlockFlook").mockImplementation(jest.fn());
    jest.spyOn(controller.helicopterFlyController, "lookAtPosition").mockImplementation(jest.fn());

    controller.updateLookState();

    expect(controller.helicopterFlyController.setBlockFlook).toHaveBeenCalledTimes(1);
    expect(controller.helicopterFlyController.setBlockFlook).toHaveBeenCalledWith(true);
    expect(controller.helicopterFlyController.lookAtPosition).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle waypoint callback with generic index", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    expect(controller.isWaypointCallbackHandled).toBe(false);
    expect(controller.lastIndex).toBeNull();

    controller.onWaypoint(object, "action-type", 10);

    expect(controller.isWaypointCallbackHandled).toBe(true);
    expect(controller.lastIndex).toBeNull();

    controller.patrolMove = new patrol("test-wp");

    controller.flagToWpCallback = true;
    controller.onWaypoint(object, "action-type", 10);

    expect(controller.isWaypointCallbackHandled).toBe(true);
    expect(controller.lastIndex).toBeNull();

    controller.flagToWpCallback = false;
    controller.onWaypoint(object, "action-type", 10);

    expect(controller.isWaypointCallbackHandled).toBe(true);
    expect(controller.lastIndex).toBe(10);
  });

  it("should correctly handle waypoint callback with reset index", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const controller: HelicopterMoveController = new HelicopterMoveController(object, state);

    controller.state.signals = new LuaTable();
    controller.lastIndex = 1;
    controller.nextIndex = 2;
    controller.patrolMove = new patrol("test-wp-sig");
    controller.patrolMoveInfo = parseWaypointsData("test-wp-sig");

    // While a fly command is in progress (flagToWpCallback), the waypoint callback is ignored entirely and
    // does not re-arm the movement update.
    controller.flagToWpCallback = true;
    controller.onWaypoint(object, "action-type", -1);

    expect(controller.isWaypointCallbackHandled).toBe(false);
    expect(controller.state.signals).toEqualLuaTables({});
    expect(controller.lastIndex).toBe(1);

    controller.flagToWpCallback = false;
    controller.onWaypoint(object, "action-type", -1);

    expect(controller.isWaypointCallbackHandled).toBe(true);
    expect(controller.state.signals).toEqualLuaTables({ b: true });
    expect(controller.lastIndex).toBe(2);
  });
});
