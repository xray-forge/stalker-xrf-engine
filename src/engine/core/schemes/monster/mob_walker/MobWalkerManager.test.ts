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
import { MobWalkerManager } from "@/engine/core/schemes/monster/mob_walker/MobWalkerManager";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";
import { patrols } from "@/fixtures/engine/mocks/patrols.mock";

jest.mock("xray16/lib", () => ({
  ...jest.requireActual<typeof import("xray16/lib")>("xray16/lib"),
  isObjectAtWaypoint: jest.fn(),
}));

describe("MobWalkerManager", () => {
  it("should fail if walk patrol is missing", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      state: EMonsterState.NONE,
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(() => manager.activate()).toThrow();
  });

  it("should fail if walk patrol is not existing", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-not-existing",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(() => manager.activate()).toThrow();
  });

  it("should activate without look patrol", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(() => manager.activate()).not.toThrow();
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    manager.activate();

    expect(state.signals).toEqualLuaTables({});
    expect(manager.patrolWalk).toBeInstanceOf(patrol);
    expect(manager.patrolLook).toBeInstanceOf(patrol);
    expect(manager.pathWalkInfo?.length()).toBe(3);
    expect(manager.pathLookInfo?.length()).toBe(3);
    expect(manager.mobState).toBe(EMobWalkerState.MOVING);
    expect(manager.crouch).toBe(false);
    expect(manager.running).toBe(false);
    expect(manager.curAnimSet).toBe(0);
    expect(manager.ptWaitTime).toBe(5000);
    expect(manager.scheduledSound).toBeNull();
    expect(manager.lastIndex).toBeNull();
    expect(manager.lastLookIndex).toBeNull();

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
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    manager.activate();
    manager.deactivate();

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
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    jest.spyOn(manager, "updateMovementState").mockImplementation(jest.fn());

    manager.activate();

    jest.spyOn(manager, "activate").mockImplementation(jest.fn());
    jest.spyOn(object, "get_script").mockImplementation(() => true);

    manager.update();
    expect(manager.activate).toHaveBeenCalledTimes(0);
    expect(manager.updateMovementState).toHaveBeenCalledTimes(0);

    jest.spyOn(object, "get_script").mockImplementation(() => false);

    manager.update();
    expect(manager.activate).toHaveBeenCalledTimes(1);
    expect(manager.updateMovementState).toHaveBeenCalledTimes(0);

    jest.spyOn(object, "get_script").mockImplementation(() => true);
    manager.mobState = EMobWalkerState.STANDING;

    manager.update();
    expect(manager.mobState).toBe(EMobWalkerState.MOVING);
    expect(manager.updateMovementState).toHaveBeenCalledTimes(1);
  });

  it("should correctly update with single point patrol", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp-single",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    jest.spyOn(manager, "updateMovementState").mockImplementation(jest.fn());
    jest.spyOn(manager, "onWaypoint").mockImplementation(jest.fn());
    jest.spyOn(object, "get_script").mockImplementation(() => true);

    replaceFunctionMock(isObjectAtWaypoint, () => true);

    manager.activate();
    manager.mobState = EMobWalkerState.STANDING;
    manager.update();

    expect(manager.mobState).toBe(EMobWalkerState.MOVING);
    expect(manager.onWaypoint).toHaveBeenCalledTimes(1);

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
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    manager.activate();

    jest.spyOn(manager, "updateMovementState").mockImplementation(jest.fn());

    state.state = EMonsterState.VISIBLE;

    manager.onWaypoint(object, "test", -1);
    expect(manager.lastIndex).toBeNull();

    manager.onWaypoint(object, "test", null);
    expect(manager.lastIndex).toBeNull();

    manager.onWaypoint(object, "test", 1);
    expect(manager.lastIndex).toBe(1);

    expect(object.set_invisible).toHaveBeenCalledTimes(1);
    expect(object.set_invisible).toHaveBeenCalledWith(false);
    expect(manager.updateMovementState).toHaveBeenCalledTimes(1);
  });

  it("should publish a configured signal before continuing from a waypoint", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      pathWalk: "mob-walker-signal",
      state: EMonsterState.NONE,
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);
    const objectState = registerObject(object);

    MockPatrol.setup({
      ...patrols,
      "mob-walker-signal": {
        points: [{ flag: 0, gvid: 1, lvid: 1, name: "wp00|sig=arrived", position: MockVector.create(0, 0, 0) }],
      },
    });
    objectState.activeScheme = EScheme.MOB_WALKER;
    setSchemeState(objectState, EScheme.MOB_WALKER, state);
    manager.activate();
    jest.spyOn(manager, "updateMovementState").mockImplementation(() => {});

    manager.onWaypoint(object, null, 0);

    expect(state.signals?.get("arrived")).toBe(true);
    expect(manager.lastIndex).toBe(0);
    expect(manager.updateMovementState).toHaveBeenCalledTimes(1);
  });

  it("should enter a standing search state for a matching look-patrol flag", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      pathLook: "mob-walker-look",
      pathWalk: "mob-walker-search",
      state: EMonsterState.NONE,
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

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
    manager.activate();
    jest.spyOn(manager, "lookAtWaypoint").mockImplementation(() => {});
    jest.spyOn(manager, "update").mockImplementation(() => {});
    jest.spyOn(manager, "updateStandingState").mockImplementation(() => {});

    manager.onWaypoint(object, null, 0);

    expect(manager.mobState).toBe(EMobWalkerState.STANDING);
    expect(manager.ptWaitTime).toBe(2500);
    expect(manager.curAnimSet).toBe(anim.stand_idle);
    expect(manager.lookAtWaypoint).toHaveBeenCalledWith(0);
    expect(manager.updateStandingState).toHaveBeenCalledTimes(1);
    expect(manager.update).toHaveBeenCalledTimes(1);
  });

  it("should correctly update look state without sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_WALKER, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    manager.activate();
    manager.updateStandingState();

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
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    manager.activate();
    manager.scheduledSound = "attack";
    manager.updateStandingState();

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
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(manager.lastIndex).toBeNull();
    manager.lookAtWaypoint(1);
    expect(manager.lastIndex).toBeNull();
    expect(object.command).toHaveBeenCalledTimes(0);

    manager.activate();

    manager.lookAtWaypoint(1);
    expect(manager.lastLookIndex).toBe(1);
    expect(object.command).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenCalledWith(true, "xrf");
  });
});
