import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject, IniFile } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockGameObject, MockIniFile } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EObjectCampActivity, EObjectCampRole, ICampStateDescriptor } from "@/engine/core/ai/camp/camp_types";
import { campConfig } from "@/engine/core/ai/camp/CampConfig";
import { CampController } from "@/engine/core/ai/camp/CampController";
import { EActionId } from "@/engine/core/ai/planner/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { getStoryPlayback } from "@/engine/core/managers/sounds/utils";
import { emitSchemeEvent } from "@/engine/core/schemes/runtime";
import { IAnimpointActionDescriptor, ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme, ESchemeEvent } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_event");

describe("CampController", () => {
  beforeEach(() => {
    resetRegistry();
    soundsConfig.storyPlaybacks = new LuaTable();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetFunctionMock(time_global);
  });

  it("should correctly initialize with default state", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const object: GameObject = MockGameObject.mock();
    const manager: CampController = new CampController(object, ini);

    expect(manager.ini).toBe(ini);
    expect(manager.object).toBe(object);
    expect(manager.storyPlayback).toBe(getStoryPlayback(`camp_${object.id()}`));
    expect(soundsConfig.storyPlaybacks.length()).toBe(1);
    expect(manager.isStoryStarted).toBe(true);
    expect(manager.activity).toBe(EObjectCampActivity.IDLE);
    expect(manager.activitySwitchAt).toBe(-1);

    expect(manager.availableSoundStories).toEqualLuaArrays(["test_story"]);
    expect(manager.availableGuitarStories).toEqualLuaArrays(["test_guitar"]);
    expect(manager.availableHarmonicaStories).toEqualLuaArrays(["test_harmonica"]);
  });

  it("should correctly initialize with custom stories", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      camp: {
        stories: "story_a, story_b",
        guitar_themes: "guitar_a, guitar_b",
        harmonica_themes: "harmonica_a, harmonica_b",
      },
    });
    const object: GameObject = MockGameObject.mock();
    const manager: CampController = new CampController(object, ini);

    expect(manager.availableSoundStories).toEqualLuaArrays(["story_a", "story_b"]);
    expect(manager.availableGuitarStories).toEqualLuaArrays(["guitar_a", "guitar_b"]);
    expect(manager.availableHarmonicaStories).toEqualLuaArrays(["harmonica_a", "harmonica_b"]);
  });

  it("should notify every participant when activity changes", () => {
    const manager: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(first);
    const secondState: IRegistryObjectState = registerObject(second);

    firstState.activeScheme = EScheme.ANIMPOINT;
    secondState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(firstState, EScheme.ANIMPOINT, mockSchemeState(EScheme.ANIMPOINT));
    setSchemeState(secondState, EScheme.ANIMPOINT, mockSchemeState(EScheme.ANIMPOINT));
    manager.objects.set(first.id(), { state: EObjectCampActivity.IDLE } as ICampStateDescriptor);
    manager.objects.set(second.id(), { state: EObjectCampActivity.IDLE } as ICampStateDescriptor);

    replaceFunctionMock(time_global, () => 100);
    jest.spyOn(manager, "updateNextState").mockImplementation(() => {
      manager.activity = EObjectCampActivity.STORY;
    });
    jest.spyOn(manager, "updateActivityDirector").mockImplementation(jest.fn());
    jest.clearAllMocks();

    manager.update(0);

    expect(emitSchemeEvent).toHaveBeenCalledWith(
      getSchemeStateOptimistic(firstState, EScheme.ANIMPOINT),
      ESchemeEvent.UPDATE
    );
    expect(emitSchemeEvent).toHaveBeenCalledWith(
      getSchemeStateOptimistic(secondState, EScheme.ANIMPOINT),
      ESchemeEvent.UPDATE
    );
  });

  it("should mark only the selected director as unavailable for meetings", () => {
    const manager: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));
    const director: GameObject = MockGameObject.mock();
    const listener: GameObject = MockGameObject.mock();
    const directorState: IRegistryObjectState = registerObject(director);
    const listenerState: IRegistryObjectState = registerObject(listener);
    const directorMeetManager: MeetManager = { isCampStoryDirector: false } as MeetManager;
    const listenerMeetManager: MeetManager = { isCampStoryDirector: true } as MeetManager;

    directorState.activeScheme = EScheme.ANIMPOINT;
    listenerState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(directorState, EScheme.ANIMPOINT, mockSchemeState(EScheme.ANIMPOINT));
    setSchemeState(listenerState, EScheme.ANIMPOINT, mockSchemeState(EScheme.ANIMPOINT));
    setSchemeState(
      directorState,
      EScheme.MEET,
      mockSchemeState<ISchemeMeetState>(EScheme.MEET, { meetManager: directorMeetManager })
    );
    setSchemeState(
      listenerState,
      EScheme.MEET,
      mockSchemeState<ISchemeMeetState>(EScheme.MEET, { meetManager: listenerMeetManager })
    );
    manager.objects.set(director.id(), { state: EObjectCampActivity.IDLE } as ICampStateDescriptor);
    manager.objects.set(listener.id(), { state: EObjectCampActivity.IDLE } as ICampStateDescriptor);

    replaceFunctionMock(time_global, () => 100);
    jest.spyOn(manager, "updateNextState").mockImplementation(() => {
      manager.activity = EObjectCampActivity.STORY;
    });
    jest.spyOn(manager, "updateActivityDirector").mockImplementation(() => {
      manager.directorId = director.id();
    });

    manager.update(0);

    expect(directorMeetManager.isCampStoryDirector).toBe(true);
    expect(listenerMeetManager.isCampStoryDirector).toBe(false);
  });

  it("should select an eligible director and reset an ineligible activity to idle", () => {
    const manager: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));
    const participant: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(participant);

    state.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      state,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
        actionNameBase: EStalkerState.ANIMPOINT_STAY_TABLE,
        description: EStalkerState.ANIMPOINT_STAY_TABLE,
      })
    );
    manager.activity = EObjectCampActivity.STORY;
    manager.objects.set(participant.id(), {
      state: EObjectCampActivity.STORY,
      [EObjectCampActivity.STORY]: EObjectCampRole.DIRECTOR,
    } as ICampStateDescriptor);

    manager.updateActivityDirector();
    expect(manager.directorId).toBe(participant.id());

    jest.spyOn(participant.motivation_action_manager(), "initialized").mockImplementation(() => true);
    jest
      .spyOn(participant.motivation_action_manager(), "current_action_id")
      .mockImplementation(() => EActionId.MEET_WAITING_ACTIVITY);
    jest.spyOn(math, "random").mockImplementation((min?: number, max?: number) => (max ? min! : 1));
    replaceFunctionMock(time_global, () => 100);

    manager.updateActivityDirector();

    expect(manager.activity).toBe(EObjectCampActivity.IDLE);
    expect(manager.directorId).toBeNull();
    expect(manager.objects.get(participant.id())!.state).toBe(EObjectCampActivity.IDLE);
    expect(manager.activitySwitchAt).toBe(30_100);
    expect(manager.activityTimeout).toBe(100);
  });

  it("should choose the next eligible activity and schedule its state transition", () => {
    const manager: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));
    const state: ICampStateDescriptor = { state: EObjectCampActivity.IDLE } as ICampStateDescriptor;
    const storyPrecondition = jest
      .spyOn(campConfig.CAMP_ACTIVITIES.get(EObjectCampActivity.STORY), "precondition")
      .mockReturnValue(true);

    manager.objects.set(1, state);
    replaceFunctionMock(time_global, () => 100);
    jest.spyOn(math, "random").mockImplementation((min?: number, max?: number) => (max ? min! : 70));

    manager.updateNextState();

    expect(storyPrecondition).toHaveBeenCalledWith(manager);
    expect(manager.activity).toBe(EObjectCampActivity.STORY);
    expect(state.state).toBe(EObjectCampActivity.STORY);
    expect(manager.activitySwitchAt).toBe(10_100);
    expect(manager.activityTimeout).toBe(100);
  });

  it("should remain idle when the selected activity is unavailable", () => {
    const manager: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));
    const state: ICampStateDescriptor = { state: EObjectCampActivity.IDLE } as ICampStateDescriptor;
    const storyPrecondition = jest
      .spyOn(campConfig.CAMP_ACTIVITIES.get(EObjectCampActivity.STORY), "precondition")
      .mockReturnValue(false);

    manager.objects.set(1, state);
    replaceFunctionMock(time_global, () => 100);
    jest.spyOn(math, "random").mockImplementation((min?: number, max?: number) => (max ? min! : 70));

    manager.updateNextState();

    expect(storyPrecondition).toHaveBeenCalledWith(manager);
    expect(manager.activity).toBe(EObjectCampActivity.IDLE);
    expect(state.state).toBe(EObjectCampActivity.IDLE);
    expect(manager.activitySwitchAt).toBe(30_100);
    expect(manager.activityTimeout).toBe(100);
  });

  for (const activity of [EObjectCampActivity.GUITAR, EObjectCampActivity.HARMONICA]) {
    it(`should stop ${activity} activity after its story finishes`, () => {
      const manager: CampController = new CampController(MockGameObject.mock(), MockIniFile.mock("test.ltx"));

      manager.activity = activity;
      manager.directorId = 10;
      manager.activitySwitchAt = 10_000;
      manager.activityTimeout = 5_000;

      replaceFunctionMock(time_global, () => 100);
      jest.spyOn(math, "random").mockImplementation((min?: number, max?: number) => (max ? min! : 50));

      manager.update(0);

      expect(manager.activity).toBe(EObjectCampActivity.IDLE);
      expect(manager.directorId).toBeNull();
      expect(manager.activityTimeout).toBe(0);
    });
  }

  it("should correctly set story", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampController = new CampController(object, MockIniFile.mock("test.ltx"));

    manager.isStoryStarted = false;

    manager.activity = EObjectCampActivity.IDLE;
    manager.updateStory();

    expect(manager.isStoryStarted).toBe(true);

    jest.spyOn(manager.storyPlayback, "setStoryTeller").mockImplementation(jest.fn());
    jest.spyOn(manager.storyPlayback, "setActiveStory").mockImplementation(jest.fn());

    manager.activity = EObjectCampActivity.STORY;
    manager.isStoryStarted = false;
    manager.directorId = 255;
    manager.updateStory();

    expect(manager.isStoryStarted).toBe(true);
    expect(manager.storyPlayback.setStoryTeller).toHaveBeenCalledWith(255);
    expect(manager.storyPlayback.setActiveStory).toHaveBeenCalledWith("test_story");
  });

  it("should correctly get object activity", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampController = new CampController(object, MockIniFile.mock("test.ltx"));
    const participant: GameObject = MockGameObject.mock();
    const participantState: IRegistryObjectState = registerObject(participant);

    participantState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      participantState,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, { approvedActions: new LuaTable() })
    );

    manager.registerObject(participant.id());

    expect(manager.getObjectActivity(-1)).toEqual([null, null]);
    expect(manager.getObjectActivity(participant.id())).toEqual([EObjectCampActivity.IDLE, false]);

    manager.directorId = participant.id();
    expect(manager.getObjectActivity(participant.id())).toEqual([EObjectCampActivity.IDLE, true]);
  });

  it("should correctly register/unregister objects with idle state", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampController = new CampController(object, MockIniFile.mock("test.ltx"));

    const firstParticipant: GameObject = MockGameObject.mock();
    const secondParticipant: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(firstParticipant);
    const secondState: IRegistryObjectState = registerObject(secondParticipant);

    jest.spyOn(manager.storyPlayback, "registerObject").mockImplementation(jest.fn());
    jest.spyOn(manager.storyPlayback, "unregisterObject").mockImplementation(jest.fn());

    expect(manager.objects).toEqualLuaTables([]);
    expect(firstState.camp).toBeUndefined();
    expect(secondState.camp).toBeUndefined();

    expect(() => manager.registerObject(firstParticipant.id())).toThrow(
      `Wrong role for object '${firstParticipant.id()}' in camp '${object.name()}', activity 'idle'.`
    );

    firstState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      firstState,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, { approvedActions: new LuaTable() })
    );
    secondState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      secondState,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, { approvedActions: new LuaTable() })
    );

    expect(manager.activity).toBe(EObjectCampActivity.IDLE);

    manager.registerObject(firstParticipant.id());

    expect(emitSchemeEvent).toHaveBeenCalledWith(
      getSchemeStateOptimistic(firstState, EScheme.ANIMPOINT),
      ESchemeEvent.UPDATE,
      -1
    );
    expect(manager.objects).toEqualLuaTables({
      [firstParticipant.id()]: {
        state: "idle",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.LISTENER,
        idle: EObjectCampRole.LISTENER,
      },
    });
    expect(firstState.camp).toBe(object.id());
    expect(secondState.camp).toBeUndefined();
    expect(manager.storyPlayback.registerObject).toHaveBeenCalledWith(firstParticipant.id());

    manager.registerObject(secondParticipant.id());

    expect(manager.objects).toEqualLuaTables({
      [firstParticipant.id()]: {
        state: "idle",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.LISTENER,
        idle: EObjectCampRole.LISTENER,
      },
      [secondParticipant.id()]: {
        state: "idle",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.LISTENER,
        idle: EObjectCampRole.LISTENER,
      },
    });
    expect(emitSchemeEvent).toHaveBeenCalledWith(
      getSchemeStateOptimistic(firstState, EScheme.ANIMPOINT),
      ESchemeEvent.UPDATE,
      -1
    );
    expect(firstState.camp).toBe(object.id());
    expect(secondState.camp).toBe(object.id());
    expect(manager.storyPlayback.registerObject).toHaveBeenCalledWith(secondParticipant.id());

    manager.unregisterObject(firstParticipant.id());
    manager.unregisterObject(secondParticipant.id());

    expect(manager.storyPlayback.unregisterObject).toHaveBeenCalledWith(firstParticipant.id());
    expect(manager.storyPlayback.unregisterObject).toHaveBeenCalledWith(secondParticipant.id());
    expect(firstState.camp).toBeNull();
    expect(secondState.camp).toBeNull();
    expect(manager.objects).toEqualLuaArrays([]);
  });

  it("should correctly register/unregister objects with guitar activity", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampController = new CampController(object, MockIniFile.mock("test.ltx"));

    const firstParticipant: GameObject = MockGameObject.mock();
    const secondParticipant: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(firstParticipant);
    const secondState: IRegistryObjectState = registerObject(secondParticipant);

    manager.activity = EObjectCampActivity.GUITAR;

    expect(manager.objects).toEqualLuaTables([]);

    expect(() => manager.registerObject(firstParticipant.id())).toThrow(
      `Wrong role for object '${firstParticipant.id()}' in camp '${object.name()}', activity 'idle'.`
    );

    firstState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      firstState,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, { approvedActions: new LuaTable() })
    );
    secondState.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      secondState,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
        description: EStalkerState.SIT_ASS,
        approvedActions: $fromArray<IAnimpointActionDescriptor>([
          { name: EStalkerState.SIT_ASS, predicate: () => true },
        ]),
      })
    );

    expect(manager.activity).toBe(EObjectCampActivity.GUITAR);

    manager.registerObject(firstParticipant.id());

    expect(manager.objects).toEqualLuaTables({
      [firstParticipant.id()]: {
        state: "guitar",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.LISTENER,
        idle: EObjectCampRole.LISTENER,
      },
    });

    manager.registerObject(secondParticipant.id());

    expect(manager.objects).toEqualLuaTables({
      [firstParticipant.id()]: {
        state: "guitar",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.LISTENER,
        idle: EObjectCampRole.LISTENER,
      },
      [secondParticipant.id()]: {
        state: "guitar",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.DIRECTOR,
        idle: EObjectCampRole.LISTENER,
      },
    });

    manager.directorId = secondParticipant.id();

    manager.unregisterObject(secondParticipant.id());

    expect(manager.isStoryStarted).toBe(false);
    expect(manager.activitySwitchAt).toBe(0);
    expect(manager.directorId).toBeNull();
    expect(manager.activity).toBe(EObjectCampActivity.IDLE);

    expect(manager.objects).toEqualLuaTables({
      [firstParticipant.id()]: {
        state: "idle",
        guitar: EObjectCampRole.LISTENER,
        harmonica: EObjectCampRole.LISTENER,
        story: EObjectCampRole.LISTENER,
        idle: EObjectCampRole.LISTENER,
      },
    });

    manager.unregisterObject(firstParticipant.id());

    expect(manager.objects).toEqualLuaTables({});
  });
});
