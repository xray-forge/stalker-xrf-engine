import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CampManager, EObjectCampActivity } from "@/engine/core/ai/camp";
import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { StalkerStateManager } from "@/engine/core/ai/state";
import { animpoint_predicates } from "@/engine/core/animation/predicates/animpoint_predicates";
import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, IRegistryObjectState, registerCampZone, registerObject } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemeWalkerState } from "@/engine/core/schemes/stalker/walker";
import { ActionWalkerActivity } from "@/engine/core/schemes/stalker/walker/actions/ActionWalkerActivity";
import { parseWaypointsData } from "@/engine/core/utils/ini";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionWalkerActivity", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());

    expect(action.state).toBe(walkerState);
    expect(action.object).toBe(object);
    expect(action.patrolManager).toBe(state.patrolManager);
    expect(action.state.description).toBe(EStalkerState.WALKER_CAMP);
    expect(action.state.approvedActions.length()).toBe(0);
  });

  it("should correctly add approved actions", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    for (const [, animpointAction] of animpoint_predicates.get(EStalkerState.WALKER_CAMP)) {
      jest.spyOn(animpointAction, "predicate").mockImplementationOnce(() => true);
    }

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    expect(action.state.approvedActions.length()).toBe(2);
  });

  it("should correctly handle initialize method", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());

    jest.spyOn(action, "reset").mockImplementation(jest.fn());

    action.initialize();

    expect(object.set_desired_direction).toHaveBeenCalled();
    expect(object.set_desired_direction).toHaveBeenCalled();
    expect(action.reset).toHaveBeenCalled();
  });

  it("should correctly handle finalize method", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());
    action.isInCamp = true;
    action.campStoryManager = new CampManager(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(action.patrolManager, "finalize").mockImplementation(jest.fn());
    jest.spyOn(action.campStoryManager, "unregisterObject").mockImplementation(jest.fn());

    action.finalize();

    expect(action.isInCamp).toBe(false);
    expect(action.patrolManager.finalize).toHaveBeenCalled();
    expect(action.campStoryManager.unregisterObject).toHaveBeenCalledWith(object.id());
  });

  it("should correctly handle activate method", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());

    jest.spyOn(action, "reset").mockImplementation(jest.fn());

    action.activate();

    expect(action.reset).toHaveBeenCalled();
    expect(action.state.signals).toEqualLuaTables({});
  });

  it("should correctly handle updates", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);
    state.stateManager = new StalkerStateManager(object);

    jest.spyOn(state.stateManager, "setState").mockImplementation(jest.fn());

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());
    action.campStoryManager = new CampManager(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(action.campStoryManager, "getObjectActivity").mockImplementation(() => $multi(null, null));

    action.update();

    expect(state.stateManager.setState).not.toHaveBeenCalled();

    jest
      .spyOn(action.campStoryManager, "getObjectActivity")
      .mockImplementation(() => $multi(EObjectCampActivity.GUITAR, true));

    action.update();

    expect(state.stateManager.setState).toHaveBeenCalledWith("play_guitar", null, null, null, null);
  });

  it("should correctly handle reset", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());

    action.state.pathWalk = "zat_b40_smart_terrain_zat_b40_merc_01_walk";
    action.state.pathLook = "zat_b40_smart_terrain_zat_b40_merc_02_look";
    action.state.team = "team-test";
    action.state.suggestedState = {
      campering: null,
      camperingFire: null,
      moving: null,
      movingFire: null,
      standing: null,
    };

    jest.spyOn(action.patrolManager, "reset").mockImplementation(jest.fn());

    action.reset();

    expect(action.state.pathWalkInfo).toEqualLuaTables(parseWaypointsData(action.state.pathWalk));
    expect(action.state.pathLookInfo).toEqualLuaTables(parseWaypointsData(action.state.pathLook));
    expect(action.patrolManager.reset).toHaveBeenCalledTimes(1);
    expect(action.patrolManager.reset).toHaveBeenCalledWith(
      walkerState.pathWalk,
      walkerState.pathWalkInfo,
      walkerState.pathLook,
      walkerState.pathLookInfo,
      walkerState.team,
      walkerState.suggestedState
    );
  });

  it("should correctly handle offline event", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.campStoryManager = new CampManager(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(action.campStoryManager, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.onSwitchOffline();

    expect(action.isInCamp).toBe(false);
    expect(action.campStoryManager.unregisterObject).not.toHaveBeenCalled();

    action.isInCamp = true;

    action.onSwitchOffline();

    expect(action.isInCamp).toBe(false);
    expect(action.campStoryManager.unregisterObject).toHaveBeenCalledWith(object.id());
  });

  it("should correctly handle execute without camp/not in camp", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);
    walkerState.soundIdle = "test-idle-sound";

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    jest.spyOn(state.patrolManager, "update").mockImplementation(jest.fn());
    jest.spyOn(manager, "play").mockImplementation(jest.fn(() => null));

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.patrolManager.update).toHaveBeenCalledTimes(1);
    expect(manager.play).toHaveBeenCalledTimes(1);
    expect(manager.play).toHaveBeenCalledWith(object.id(), "test-idle-sound");
  });

  it("should correctly handle execute without camp in camp", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.isInCamp = true;
    action.campStoryManager = new CampManager(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(state.patrolManager, "update").mockImplementation(jest.fn());
    jest.spyOn(action.campStoryManager, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.isInCamp).toBe(false);
    expect(action.patrolManager.update).toHaveBeenCalledTimes(1);
    expect(action.campStoryManager?.unregisterObject).toHaveBeenCalledTimes(1);
    expect(action.campStoryManager?.unregisterObject).toHaveBeenCalledWith(object.id());
  });

  it("should correctly handle execute with camp", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);
    const campManager: CampManager = new CampManager(MockGameObject.mock(), MockIniFile.mock("test.ltx"));

    registerCampZone(campManager.object, campManager);

    jest.spyOn(campManager.object, "inside").mockImplementation(() => true);
    jest.spyOn(campManager, "registerObject").mockImplementation(jest.fn());

    state.patrolManager = new StalkerPatrolManager(object);
    walkerState.useCamp = true;

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    jest.spyOn(state.patrolManager, "update").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.isInCamp).toBe(true);
    expect(action.patrolManager.update).toHaveBeenCalledTimes(1);
    expect(action.campStoryManager).toBe(campManager);
    expect(action.campStoryManager?.registerObject).toHaveBeenCalledTimes(1);
    expect(action.campStoryManager?.registerObject).toHaveBeenCalledWith(object.id());
  });
});
