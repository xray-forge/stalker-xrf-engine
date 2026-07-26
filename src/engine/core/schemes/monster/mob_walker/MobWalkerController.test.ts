import { describe, expect, it, jest } from "@jest/globals";
import { anim, clsid, patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { isObjectAtWaypoint, TName } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { MockGameObject, MockPatrol, MockVector } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { EMonsterState } from "@/engine/constants/monsters";
import { registerObject } from "@/engine/core/database";
import { EMobWalkerState, ISchemeMobWalkerState } from "@/engine/core/schemes/monster/mob_walker/mob_walker_types";
import { MobWalkerController } from "@/engine/core/schemes/monster/mob_walker/MobWalkerController";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";
import { patrols } from "@/fixtures/engine/mocks/patrols.mock";

jest.mock("xray16/lib", () => ({
  ...jest.requireActual<typeof import("xray16/lib")>("xray16/lib"),
  isObjectAtWaypoint: jest.fn(),
}));

describe("MobWalkerController", () => {
  it("should fail if walk patrol is missing", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      state: EMonsterState.NONE,
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    expect(() => controller.activate()).toThrow();
  });

  it("should fail if walk patrol is not existing", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-not-existing",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    expect(() => controller.activate()).toThrow();
  });

  it("should activate without look patrol", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    expect(() => controller.activate()).not.toThrow();
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    controller.activate();

    expect(state.signals).toEqualLuaTables({});
    expect(controller.patrolWalk).toBeInstanceOf(patrol);
    expect(controller.patrolLook).toBeInstanceOf(patrol);
    expect(controller.pathWalkInfo?.length()).toBe(3);
    expect(controller.pathLookInfo?.length()).toBe(3);
    expect(controller.mobState).toBe(EMobWalkerState.MOVING);
    expect(controller.crouch).toBe(false);
    expect(controller.running).toBe(false);
    expect(controller.curAnimSet).toBe(0);
    expect(controller.ptWaitTime).toBe(5000);
    expect(controller.scheduledSound).toBeNull();
    expect(controller.lastIndex).toBeNull();
    expect(controller.lastLookIndex).toBeNull();

    expect(object.script).toHaveBeenCalledWith(true, "xrf");
    expect(object.command).toHaveBeenCalledTimes(1);
  });

  it("should correctly deactivate", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    controller.activate();
    controller.deactivate();

    expect(object.script).toHaveBeenCalledWith(true, "xrf");
    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.command).toHaveBeenCalledTimes(2);
  });

  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    jest.spyOn(controller, "updateMovementState").mockImplementation(jest.fn());

    controller.activate();

    jest.spyOn(controller, "activate").mockImplementation(jest.fn());
    jest.spyOn(object, "get_script").mockImplementation(() => true);

    controller.update();
    expect(controller.activate).toHaveBeenCalledTimes(0);
    expect(controller.updateMovementState).toHaveBeenCalledTimes(0);

    jest.spyOn(object, "get_script").mockImplementation(() => false);

    controller.update();
    expect(controller.activate).toHaveBeenCalledTimes(1);
    expect(controller.updateMovementState).toHaveBeenCalledTimes(0);

    jest.spyOn(object, "get_script").mockImplementation(() => true);
    controller.mobState = EMobWalkerState.STANDING;

    controller.update();
    expect(controller.mobState).toBe(EMobWalkerState.MOVING);
    expect(controller.updateMovementState).toHaveBeenCalledTimes(1);
  });

  it("should correctly update with single point patrol", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp-single",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    jest.spyOn(controller, "updateMovementState").mockImplementation(jest.fn());
    jest.spyOn(controller, "onWaypoint").mockImplementation(jest.fn());
    jest.spyOn(object, "get_script").mockImplementation(() => true);

    replaceFunctionMock(isObjectAtWaypoint, () => true);

    controller.activate();
    controller.mobState = EMobWalkerState.STANDING;
    controller.update();

    expect(controller.mobState).toBe(EMobWalkerState.MOVING);
    expect(controller.onWaypoint).toHaveBeenCalledTimes(1);

    replaceFunctionMock(isObjectAtWaypoint, () => false);
  });

  it("should correctly handle waypoints when search flags are not set", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp-advanced",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    controller.activate();

    jest.spyOn(controller, "updateMovementState").mockImplementation(jest.fn());

    state.state = EMonsterState.VISIBLE;

    controller.onWaypoint(object, "test", -1);
    expect(controller.lastIndex).toBeNull();

    controller.onWaypoint(object, "test", null);
    expect(controller.lastIndex).toBeNull();

    controller.onWaypoint(object, "test", 1);
    expect(controller.lastIndex).toBe(1);

    expect(object.set_invisible).toHaveBeenCalledTimes(1);
    expect(object.set_invisible).toHaveBeenCalledWith(false);
    expect(controller.updateMovementState).toHaveBeenCalledTimes(1);
  });

  it("should publish a configured signal before continuing from a waypoint", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      pathWalk: "mob-walker-signal",
      state: EMonsterState.NONE,
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);
    const objectState = registerObject(object);

    MockPatrol.setup({
      ...patrols,
      "mob-walker-signal": {
        points: [{ flag: 0, gvid: 1, lvid: 1, name: "wp00|sig=arrived", position: MockVector.create(0, 0, 0) }],
      },
    });
    objectState.activeScheme = EScheme.MOB_WALKER;
    setSchemeState(objectState, EScheme.MOB_WALKER, state);
    controller.activate();
    jest.spyOn(controller, "updateMovementState").mockImplementation(() => {});

    controller.onWaypoint(object, null, 0);

    expect(state.signals?.get("arrived")).toBe(true);
    expect(controller.lastIndex).toBe(0);
    expect(controller.updateMovementState).toHaveBeenCalledTimes(1);
  });

  it("should enter a standing search state for a matching look-patrol flag", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      pathLook: "mob-walker-look",
      pathWalk: "mob-walker-search",
      state: EMonsterState.NONE,
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    MockPatrol.setup({
      ...patrols,
      "mob-walker-look": {
        points: [
          {
            flag: 1,
            gvid: 1,
            lvid: 1,
            name: "wp00|a=stand_idle|t=2500",
            position: MockVector.create(0, 0, 0),
          },
        ],
      },
      "mob-walker-search": {
        points: [{ flag: 1, gvid: 1, lvid: 1, name: "wp00", position: MockVector.create(0, 0, 0) }],
      },
    });
    controller.activate();
    jest.spyOn(controller, "lookAtWaypoint").mockImplementation(() => {});
    jest.spyOn(controller, "update").mockImplementation(() => {});
    jest.spyOn(controller, "updateStandingState").mockImplementation(() => {});

    controller.onWaypoint(object, null, 0);

    expect(controller.mobState).toBe(EMobWalkerState.STANDING);
    expect(controller.ptWaitTime).toBe(2500);
    expect(controller.curAnimSet).toBe(anim.stand_idle);
    expect(controller.lookAtWaypoint).toHaveBeenCalledWith(0);
    expect(controller.updateStandingState).toHaveBeenCalledTimes(1);
    expect(controller.update).toHaveBeenCalledTimes(1);
  });

  it("should correctly update look state without sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    controller.activate();
    controller.updateStandingState();

    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.command).toHaveBeenCalledTimes(2);
  });

  it("should correctly update look state with sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    controller.activate();
    controller.scheduledSound = "attack";
    controller.updateStandingState();

    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.command).toHaveBeenCalledTimes(2);
  });

  it("should correctly look at waypoints", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const controller: MobWalkerController = new MobWalkerController(object, state);

    expect(controller.lastIndex).toBeNull();
    controller.lookAtWaypoint(1);
    expect(controller.lastIndex).toBeNull();
    expect(object.command).toHaveBeenCalledTimes(0);

    controller.activate();

    controller.lookAtWaypoint(1);
    expect(controller.lastLookIndex).toBe(1);
    expect(object.command).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenCalledWith(true, "xrf");
  });
});
