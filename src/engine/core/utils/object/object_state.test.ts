import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { animstates } from "@/engine/core/objects/state_lib/state_mgr_animstate_list";
import { EActionId } from "@/engine/core/schemes";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { WoundManager } from "@/engine/core/schemes/wounded/WoundManager";
import { isObjectAsleep, isObjectMeeting, isObjectWounded } from "@/engine/core/utils/object/object_state";
import { ActionPlanner, ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/utils";
import { mockClientGameObject } from "@/fixtures/xray";

describe("object state utils", () => {
  it("'isObjectAsleep' should check state correctly", () => {
    const object: ClientObject = mockClientGameObject();

    expect(isObjectAsleep(object.id())).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(isObjectAsleep(object.id())).toBe(false);

    state.stateManager = new StalkerStateManager(object);

    state.stateManager.animstate = new StalkerAnimationManager(
      object,
      state.stateManager,
      StalkerAnimationManager.ANIMSTATE_MANAGER,
      animstates
    );

    expect(isObjectAsleep(object.id())).toBe(false);

    state.stateManager.animstate.states.currentState = EStalkerState.SLEEP;
    expect(isObjectAsleep(object.id())).toBe(true);

    state.stateManager.animstate.states.currentState = EStalkerState.SALUT;
    expect(isObjectAsleep(object.id())).toBe(false);
  });

  it("'isObjectWounded' should correctly check wounded state", () => {
    const object: ClientObject = mockClientGameObject();

    expect(isObjectWounded(object.id())).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(isObjectWounded(object.id())).toBe(false);

    const schemeState: ISchemeWoundedState = mockSchemeState(object, EScheme.WOUNDED, {});
    const woundManager: WoundManager = new WoundManager(object, schemeState);

    schemeState.woundManager = woundManager;
    state[EScheme.WOUNDED] = schemeState;

    expect(isObjectWounded(object.id())).toBe(false);

    woundManager.woundState = "test";
    expect(isObjectWounded(object.id())).toBe(true);

    woundManager.woundState = "another";
    expect(isObjectWounded(object.id())).toBe(true);

    woundManager.woundState = "nil";
    expect(isObjectWounded(object.id())).toBe(false);
  });

  it("'isObjectMeeting' should correctly check meeting state", () => {
    const object: ClientObject = mockClientGameObject();

    expect(isObjectMeeting(object)).toBe(false);

    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    expect(actionPlanner.initialized()).toBe(false);
    expect(actionPlanner.current_action_id()).toBeNull();

    jest.spyOn(actionPlanner, "initialized").mockImplementation(() => true);
    jest.spyOn(actionPlanner, "current_action_id").mockImplementation(() => EActionId.ALIFE);
    expect(isObjectMeeting(object)).toBe(false);

    jest.spyOn(actionPlanner, "current_action_id").mockImplementation(() => EActionId.MEET_WAITING_ACTIVITY);
    expect(isObjectMeeting(object)).toBe(true);

    replaceFunctionMock(object.motivation_action_manager, () => null);
    expect(isObjectMeeting(object)).toBe(false);
  });
});
