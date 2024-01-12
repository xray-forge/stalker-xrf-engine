import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CampManager } from "@/engine/core/ai/camp";
import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { animpoint_predicates } from "@/engine/core/animation/predicates/animpoint_predicates";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeWalkerState } from "@/engine/core/schemes/stalker/walker";
import { ActionWalkerActivity } from "@/engine/core/schemes/stalker/walker/actions/ActionWalkerActivity";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionWalkerActivity class", () => {
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

  it.todo("should correctly handle updates");

  it.todo("should correctly handle execute");

  it.todo("should correctly handle reset");

  it("should correctly handle offline event", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const walkerState: ISchemeWalkerState = mockSchemeState(EScheme.WALKER);
    const action: ActionWalkerActivity = new ActionWalkerActivity(walkerState, object);

    state.patrolManager = new StalkerPatrolManager(object);
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
});
