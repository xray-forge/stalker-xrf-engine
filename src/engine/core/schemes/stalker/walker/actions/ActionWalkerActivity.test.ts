import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockIniFile, MockPropertyStorage } from "xray16/mocks";

import { CampController, EObjectCampActivity } from "@/engine/core/ai/camp";
import { StalkerPatrolController } from "@/engine/core/ai/patrol";
import { StalkerStateController } from "@/engine/core/ai/state";
import { animpoint_predicates } from "@/engine/core/animation/predicates/animpoint_predicates";
import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, IRegistryObjectState, registerCampZone, registerObject } from "@/engine/core/database";
import { parseWaypointsData } from "@/engine/core/ini";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemeWalkerState } from "@/engine/core/schemes/stalker/walker";
import { ActionWalkerActivity } from "@/engine/core/schemes/stalker/walker/actions/ActionWalkerActivity";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("ActionWalkerActivity", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolController = new StalkerPatrolController(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());

    expect(action.state).toBe(walkerState);
    expect(action.object).toBe(object);
    expect(action.patrolController).toBe(state.patrolController);
    expect(action.state.description).toBe(EStalkerState.WALKER_CAMP);
    expect(action.state.approvedActions.length()).toBe(0);
  });

  it("should correctly add approved actions", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolController = new StalkerPatrolController(object);

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

    state.patrolController = new StalkerPatrolController(object);

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

    state.patrolController = new StalkerPatrolController(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());
    action.isInCamp = true;
    action.campController = new CampController(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(action.patrolController, "finalize").mockImplementation(jest.fn());
    jest.spyOn(action.campController, "unregisterObject").mockImplementation(jest.fn());

    action.finalize();

    expect(action.isInCamp).toBe(false);
    expect(action.patrolController.finalize).toHaveBeenCalled();
    expect(action.campController.unregisterObject).toHaveBeenCalledWith(object.id());
  });

  it("should correctly handle activate method", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolController = new StalkerPatrolController(object);

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

    state.patrolController = new StalkerPatrolController(object);
    state.stateController = new StalkerStateController(object);

    jest.spyOn(state.stateController, "setState").mockImplementation(jest.fn());

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.setup(object, MockPropertyStorage.mock());
    action.campController = new CampController(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(action.campController, "getObjectActivity").mockImplementation(() => $multi(null, null));

    action.update();

    expect(state.stateController.setState).not.toHaveBeenCalled();

    jest
      .spyOn(action.campController, "getObjectActivity")
      .mockImplementation(() => $multi(EObjectCampActivity.GUITAR, true));

    action.update();

    expect(state.stateController.setState).toHaveBeenCalledWith("play_guitar", null, null, null, null);
  });

  it("should correctly handle reset", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolController = new StalkerPatrolController(object);

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

    jest.spyOn(action.patrolController, "reset").mockImplementation(jest.fn());

    action.reset();

    expect(action.state.pathWalkInfo).toEqualLuaTables(parseWaypointsData(action.state.pathWalk));
    expect(action.state.pathLookInfo).toEqualLuaTables(parseWaypointsData(action.state.pathLook));
    expect(action.patrolController.reset).toHaveBeenCalledTimes(1);
    expect(action.patrolController.reset).toHaveBeenCalledWith(
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

    state.patrolController = new StalkerPatrolController(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.campController = new CampController(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(action.campController, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.onSwitchOffline();

    expect(action.isInCamp).toBe(false);
    expect(action.campController.unregisterObject).not.toHaveBeenCalled();

    action.isInCamp = true;

    action.onSwitchOffline();

    expect(action.isInCamp).toBe(false);
    expect(action.campController.unregisterObject).toHaveBeenCalledWith(object.id());
  });

  it("should correctly handle execute without camp/not in camp", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolController = new StalkerPatrolController(object);
    walkerState.soundIdle = "test-idle-sound";

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    jest.spyOn(state.patrolController, "update").mockImplementation(jest.fn());
    jest.spyOn(manager, "play").mockImplementation(jest.fn(() => null));

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.patrolController.update).toHaveBeenCalledTimes(1);
    expect(manager.play).toHaveBeenCalledTimes(1);
    expect(manager.play).toHaveBeenCalledWith(object.id(), "test-idle-sound");
  });

  it("should correctly handle execute without camp in camp", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);

    state.patrolController = new StalkerPatrolController(object);

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    action.isInCamp = true;
    action.campController = new CampController(object, MockIniFile.mock("test.ltx"));

    jest.spyOn(state.patrolController, "update").mockImplementation(jest.fn());
    jest.spyOn(action.campController, "unregisterObject").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.isInCamp).toBe(false);
    expect(action.patrolController.update).toHaveBeenCalledTimes(1);
    expect(action.campController?.unregisterObject).toHaveBeenCalledTimes(1);
    expect(action.campController?.unregisterObject).toHaveBeenCalledWith(object.id());
  });

  it("should correctly handle execute with camp", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);
    const campController: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));

    registerCampZone(campController.object, campController);

    jest.spyOn(campController.object, "inside").mockImplementation(() => true);
    jest.spyOn(campController, "registerObject").mockImplementation(jest.fn());

    state.patrolController = new StalkerPatrolController(object);
    walkerState.useCamp = true;

    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    jest.spyOn(state.patrolController, "update").mockImplementation(jest.fn());

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(action.isInCamp).toBe(true);
    expect(action.patrolController.update).toHaveBeenCalledTimes(1);
    expect(action.campController).toBe(campController);
    expect(action.campController?.registerObject).toHaveBeenCalledTimes(1);
    expect(action.campController?.registerObject).toHaveBeenCalledWith(object.id());
  });
});
