import { describe, expect, it, jest } from "@jest/globals";

import { EActionId } from "@/engine/core/ai/planner/types";
import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EAnimationType, EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import {
  isObjectAsleep,
  isObjectHelpingWounded,
  isObjectInCombat,
  isObjectMeeting,
  isObjectSearchingCorpse,
  isObjectWounded,
} from "@/engine/core/utils/planner";
import { ActionPlanner, EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockActionPlanner, MockGameObject } from "@/fixtures/xray";

describe("isObjectAsleep util", () => {
  it("should check state correctly", () => {
    const object: GameObject = MockGameObject.mock();

    expect(isObjectAsleep(object.id())).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(isObjectAsleep(object.id())).toBe(false);

    state.stateManager = new StalkerStateManager(object);

    state.stateManager.animstate = new StalkerAnimationManager(object, state.stateManager, EAnimationType.ANIMSTATE);

    expect(isObjectAsleep(object.id())).toBe(false);

    state.stateManager.animstate.state.currentState = EStalkerState.SLEEP;
    expect(isObjectAsleep(object.id())).toBe(true);

    state.stateManager.animstate.state.currentState = EStalkerState.SALUT;
    expect(isObjectAsleep(object.id())).toBe(false);
  });
});

describe("isObjectWounded util", () => {
  it("should correctly check wounded state", () => {
    const object: GameObject = MockGameObject.mock();

    expect(isObjectWounded(object.id())).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(isObjectWounded(object.id())).toBe(false);

    const schemeState: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED, {});
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
});

describe("isObjectMeeting util", () => {
  it("should correctly check meeting state", () => {
    const object: GameObject = MockGameObject.mock();

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

describe("object state utils", () => {
  it("isObjectInCombat should correctly check object combat state", () => {
    const object: GameObject = MockGameObject.mock();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    expect(isObjectInCombat(object)).toBe(false);

    planner.isInitialized = true;
    expect(isObjectInCombat(object)).toBe(false);

    planner.currentActionId = EActionId.MEET_WAITING_ACTIVITY;
    expect(isObjectInCombat(object)).toBe(false);

    planner.currentActionId = EActionId.COMBAT;
    expect(isObjectInCombat(object)).toBe(true);

    planner.currentActionId = EActionId.POST_COMBAT_WAIT;
    expect(isObjectInCombat(object)).toBe(true);

    planner.currentActionId = EActionId.CRITICALLY_WOUNDED;
    expect(isObjectInCombat(object)).toBe(false);
  });
});

describe("isObjectSearchingCorpse util", () => {
  it("should correctly check object searching corpse state", () => {
    const object: GameObject = MockGameObject.mock();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.isInitialized = true;
    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.currentActionId = EActionId.MEET_WAITING_ACTIVITY;
    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.currentActionId = EActionId.SEARCH_CORPSE;
    expect(isObjectSearchingCorpse(object)).toBe(true);

    planner.currentActionId = EActionId.POST_COMBAT_WAIT;
    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.currentActionId = EActionId.CRITICALLY_WOUNDED;
    expect(isObjectSearchingCorpse(object)).toBe(false);
  });
});

describe("isObjectHelpingWounded state utils", () => {
  it("should correctly check object helping wounded state", () => {
    const object: GameObject = MockGameObject.mock();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.isInitialized = true;
    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.currentActionId = EActionId.MEET_WAITING_ACTIVITY;
    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.currentActionId = EActionId.HELP_WOUNDED;
    expect(isObjectHelpingWounded(object)).toBe(true);

    planner.currentActionId = EActionId.POST_COMBAT_WAIT;
    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.currentActionId = EActionId.CRITICALLY_WOUNDED;
    expect(isObjectHelpingWounded(object)).toBe(false);
  });
});
