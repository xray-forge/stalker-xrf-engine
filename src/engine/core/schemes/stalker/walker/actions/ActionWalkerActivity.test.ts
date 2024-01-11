import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CampManager } from "@/engine/core/ai/camp";
import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
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

  it.todo("should correctly initialize");

  it.todo("should correctly execute");

  it.todo("should correctly handle updates");

  it.todo("should correctly handle net events");

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
