import { describe, expect, it, jest } from "@jest/globals";

import {
  canPlayCampGuitar,
  canPlayCampHarmonica,
  canTellCampStory,
  getObjectCampActivityRole,
  startPlayingGuitar,
  startPlayingHarmonica,
} from "@/engine/core/ai/camp/camp_utils";
import { CampManager, EObjectCampActivity, EObjectCampRole } from "@/engine/core/ai/camp/index";
import { EActionId } from "@/engine/core/ai/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerCampZone, registerObject, registry } from "@/engine/core/database";
import { IAnimpointActionDescriptor, ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("camp utils", () => {
  it("startPlayingGuitar should correctly start playing without camp", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => startPlayingGuitar(object)).not.toThrow();
    expect(registry.objects.get(object.id()).camp).toBeUndefined();
  });

  it("startPlayingGuitar should correctly start playing with camp", () => {
    const object: GameObject = MockGameObject.mock();
    const camp: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(manager.storyManager, "setStoryTeller").mockImplementation(jest.fn());
    jest.spyOn(manager.storyManager, "setActiveStory").mockImplementation(jest.fn());
    jest.spyOn(manager.storyManager, "update").mockImplementation(jest.fn());

    state.camp = camp.id();

    manager.directorId = 450;

    registerCampZone(camp, manager);
    startPlayingGuitar(object);

    expect(manager.storyManager.setStoryTeller).toHaveBeenCalledWith(450);
    expect(manager.storyManager.setActiveStory).toHaveBeenCalledWith("test_guitar");
    expect(manager.storyManager.update).toHaveBeenCalledTimes(1);
  });

  it("startPlayingHarmonica should correctly start playing without camp", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => startPlayingHarmonica(object)).not.toThrow();
    expect(registry.objects.get(object.id()).camp).toBeUndefined();
  });

  it("startPlayingHarmonica should correctly start playing with camp", () => {
    const object: GameObject = MockGameObject.mock();
    const camp: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(manager.storyManager, "setStoryTeller").mockImplementation(jest.fn());
    jest.spyOn(manager.storyManager, "setActiveStory").mockImplementation(jest.fn());
    jest.spyOn(manager.storyManager, "update").mockImplementation(jest.fn());

    state.camp = camp.id();

    manager.directorId = 450;

    registerCampZone(camp, manager);
    startPlayingHarmonica(object);

    expect(manager.storyManager.setStoryTeller).toHaveBeenCalledWith(450);
    expect(manager.storyManager.setActiveStory).toHaveBeenCalledWith("test_harmonica");
    expect(manager.storyManager.update).toHaveBeenCalledTimes(1);
  });

  it("canTellCampStory should correctly check", () => {
    const camp: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));

    expect(canTellCampStory(manager)).toBe(false);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstState: IRegistryObjectState = registerObject(first);
    const secondState: IRegistryObjectState = registerObject(second);

    firstState.activeScheme = EScheme.ANIMPOINT;
    firstState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: () => true },
      ]),
    });

    secondState.activeScheme = EScheme.ANIMPOINT;
    secondState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: () => true },
      ]),
    });

    manager.registerObject(first.id());
    expect(canTellCampStory(manager)).toBe(false);

    manager.registerObject(second.id());
    expect(canTellCampStory(manager)).toBe(true);

    // Meeting activity stops story.
    jest.spyOn(second.motivation_action_manager(), "initialized").mockImplementation(() => true);
    jest
      .spyOn(second.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.MEET_WAITING_ACTIVITY);
    expect(canTellCampStory(manager)).toBe(false);

    // OK with animpoint action.
    jest
      .spyOn(second.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.ANIMPOINT_ACTIVITY);
    expect(canTellCampStory(manager)).toBe(true);

    manager.availableSoundStories = new LuaTable();
    expect(canTellCampStory(manager)).toBe(false);
  });

  it("canPlayCampGuitar should correctly check", () => {
    const camp: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));

    expect(canPlayCampGuitar(manager)).toBe(false);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstState: IRegistryObjectState = registerObject(first);
    const secondState: IRegistryObjectState = registerObject(second);

    firstState.activeScheme = EScheme.ANIMPOINT;
    firstState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: () => true },
      ]),
    });

    secondState.activeScheme = EScheme.ANIMPOINT;
    secondState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      description: EStalkerState.ANIMPOINT_SIT_ASS,
      actionNameBase: EStalkerState.ANIMPOINT_SIT_ASS,
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_SIT_ASS_GUITAR, predicate: () => true },
      ]),
    });

    manager.registerObject(first.id());
    expect(canPlayCampGuitar(manager)).toBe(false);

    manager.registerObject(second.id());
    expect(canPlayCampGuitar(manager)).toBe(true);

    // Meeting activity stops playing.
    jest.spyOn(second.motivation_action_manager(), "initialized").mockImplementation(() => true);
    jest
      .spyOn(second.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.MEET_WAITING_ACTIVITY);
    expect(canPlayCampGuitar(manager)).toBe(false);

    // OK with animpoint action.
    jest
      .spyOn(second.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.ANIMPOINT_ACTIVITY);
    expect(canPlayCampGuitar(manager)).toBe(true);

    manager.availableGuitarStories = new LuaTable();
    expect(canPlayCampGuitar(manager)).toBe(false);
  });

  it("canPlayCampHarmonica should correctly check", () => {
    const camp: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));

    expect(canPlayCampHarmonica(manager)).toBe(false);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstState: IRegistryObjectState = registerObject(first);
    const secondState: IRegistryObjectState = registerObject(second);

    firstState.activeScheme = EScheme.ANIMPOINT;
    firstState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: () => true },
      ]),
    });

    secondState.activeScheme = EScheme.ANIMPOINT;
    secondState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      description: EStalkerState.ANIMPOINT_SIT_ASS,
      actionNameBase: EStalkerState.ANIMPOINT_SIT_ASS,
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_SIT_ASS_HARMONICA, predicate: () => true },
      ]),
    });

    manager.registerObject(first.id());
    expect(canPlayCampHarmonica(manager)).toBe(false);

    manager.registerObject(second.id());
    expect(canPlayCampHarmonica(manager)).toBe(true);

    // Meeting activity stops playing.
    jest.spyOn(second.motivation_action_manager(), "initialized").mockImplementation(() => true);
    jest
      .spyOn(second.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.MEET_WAITING_ACTIVITY);
    expect(canPlayCampHarmonica(manager)).toBe(false);

    // OK with animpoint action.
    jest
      .spyOn(second.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.ANIMPOINT_ACTIVITY);
    expect(canPlayCampHarmonica(manager)).toBe(true);

    manager.availableHarmonicaStories = new LuaTable();
    expect(canPlayCampHarmonica(manager)).toBe(false);
  });

  it("getObjectCampActivityRole should correctly get object roles for generic activities", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;

    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.IDLE)).toBe(EObjectCampRole.NONE);
    expect(getObjectCampActivityRole(object.id(), "unexpected" as unknown as EObjectCampActivity)).toBe(
      EObjectCampRole.NONE
    );

    state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.IDLE)).toBe(EObjectCampRole.LISTENER);
    expect(getObjectCampActivityRole(object.id(), "unexpected" as unknown as EObjectCampActivity)).toBe(
      EObjectCampRole.NONE
    );
  });

  it("getObjectCampActivityRole should correctly get object roles for harmonica/guitar", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;

    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.HARMONICA)).toBe(EObjectCampRole.NONE);
    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.GUITAR)).toBe(EObjectCampRole.NONE);

    state[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      description: EStalkerState.ANIMPOINT_SIT_ASS,
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_SIT_ASS_GUITAR, predicate: () => true },
        { name: EStalkerState.ANIMPOINT_SIT_ASS_HARMONICA, predicate: () => true },
      ]),
    });

    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.GUITAR)).toBe(EObjectCampRole.DIRECTOR);
    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.HARMONICA)).toBe(EObjectCampRole.DIRECTOR);
  });

  it("getObjectCampActivityRole should correctly get object roles for story teller", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;

    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.HARMONICA)).toBe(EObjectCampRole.NONE);
    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.GUITAR)).toBe(EObjectCampRole.NONE);

    state[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON, predicate: () => true },
        { name: EStalkerState.ANIMPOINT_STAY_TABLE, predicate: () => true },
      ]),
    });

    (state[EScheme.ANIMPOINT] as ISchemeAnimpointState).description = EStalkerState.STOOP_NO_WEAP;
    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.STORY)).toBe(EObjectCampRole.LISTENER);

    (state[EScheme.ANIMPOINT] as ISchemeAnimpointState).description = EStalkerState.ANIMPOINT_STAY_TABLE;
    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.STORY)).toBe(EObjectCampRole.DIRECTOR);

    (state[EScheme.ANIMPOINT] as ISchemeAnimpointState).description = EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON;
    expect(getObjectCampActivityRole(object.id(), EObjectCampActivity.STORY)).toBe(EObjectCampRole.DIRECTOR);
  });
});
