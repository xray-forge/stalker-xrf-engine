import { describe, expect, it, jest } from "@jest/globals";
import { clsid, patrol } from "xray16";

import { EMobWalkerState, ISchemeMobWalkerState } from "@/engine/core/schemes/monster/mob_walker/mob_walker_types";
import { MobWalkerManager } from "@/engine/core/schemes/monster/mob_walker/MobWalkerManager";
import { isObjectAtWaypoint } from "@/engine/core/utils/patrol";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { ClientObject, EScheme, TName } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/patrol", () => ({
  isObjectAtWaypoint: jest.fn(() => false),
}));

describe("MobWalkerManager", () => {
  it("should fail if walk patrol is missing", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
      state: EMonsterState.NONE,
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(() => manager.activate()).toThrow();
  });

  it("should fail if walk patrol is not existing", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-not-existing",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(() => manager.activate()).toThrow();
  });

  it("should activate without look patrol", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    expect(() => manager.activate()).not.toThrow();
  });

  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject({ clsid: () => clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
    const object: ClientObject = mockClientGameObject({ clsid: () => clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
    const object: ClientObject = mockClientGameObject({ clsid: () => clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
    const object: ClientObject = mockClientGameObject({ clsid: () => clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
    const object: ClientObject = mockClientGameObject({ clsid: () => clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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

  it.todo("should correctly handle waypoints when search signal is set");

  it.todo("should correctly handle waypoints when search flags are set");

  it("should correctly update look state without sound", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
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
