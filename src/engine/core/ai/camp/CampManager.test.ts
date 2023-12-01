import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EObjectCampActivity, EObjectCampRole } from "@/engine/core/ai/camp/camp_types";
import { CampManager } from "@/engine/core/ai/camp/CampManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { getStoryManager } from "@/engine/core/managers/sounds/utils";
import { IAnimpointActionDescriptor, ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeEvent, GameObject, IniFile } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme/scheme_event", () => ({
  emitSchemeEvent: jest.fn(),
}));

describe("CampManager class", () => {
  beforeEach(() => {
    soundsConfig.managers = new LuaTable();
  });

  it("should correctly initialize with default state", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const object: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(object, ini);

    expect(manager.ini).toBe(ini);
    expect(manager.object).toBe(object);
    expect(manager.storyManager).toBe(getStoryManager(`camp_${object.id()}`));
    expect(soundsConfig.managers.length()).toBe(1);
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
    const manager: CampManager = new CampManager(object, ini);

    expect(manager.availableSoundStories).toEqualLuaArrays(["story_a", "story_b"]);
    expect(manager.availableGuitarStories).toEqualLuaArrays(["guitar_a", "guitar_b"]);
    expect(manager.availableHarmonicaStories).toEqualLuaArrays(["harmonica_a", "harmonica_b"]);
  });

  it.todo("should correctly handle update event");

  it.todo("should correctly set next states");

  it.todo("should correctly get current director");

  it.todo("should correctly set story");

  it("should correctly get object activity", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(object, MockIniFile.mock("test.ltx"));
    const participant: GameObject = MockGameObject.mock();
    const participantState: IRegistryObjectState = registerObject(participant);

    participantState.activeScheme = EScheme.ANIMPOINT;
    participantState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: MockLuaTable.mock(),
    });

    manager.registerObject(participant.id());

    expect(manager.getObjectActivity(-1)).toEqual([null, null]);
    expect(manager.getObjectActivity(participant.id())).toEqual([EObjectCampActivity.IDLE, false]);

    manager.directorId = participant.id();
    expect(manager.getObjectActivity(participant.id())).toEqual([EObjectCampActivity.IDLE, true]);
  });

  it("should correctly register/unregister objects with idle state", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(object, MockIniFile.mock("test.ltx"));

    const firstParticipant: GameObject = MockGameObject.mock();
    const secondParticipant: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(firstParticipant);
    const secondState: IRegistryObjectState = registerObject(secondParticipant);

    jest.spyOn(manager.storyManager, "registerObject").mockImplementation(jest.fn());
    jest.spyOn(manager.storyManager, "unregisterObject").mockImplementation(jest.fn());

    expect(manager.objects).toEqualLuaTables([]);
    expect(firstState.camp).toBeUndefined();
    expect(secondState.camp).toBeUndefined();

    expect(() => manager.registerObject(firstParticipant.id())).toThrow(
      `Wrong role for object '${firstParticipant.id()}' in camp '${object.name()}', activity 'idle'.`
    );

    firstState.activeScheme = EScheme.ANIMPOINT;
    firstState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: MockLuaTable.mock(),
    });
    secondState.activeScheme = EScheme.PATROL;
    secondState[EScheme.PATROL] = mockSchemeState<ISchemeAnimpointState>(EScheme.PATROL, {
      approvedActions: MockLuaTable.mock(),
    });

    expect(manager.activity).toBe(EObjectCampActivity.IDLE);

    manager.registerObject(firstParticipant.id());

    expect(emitSchemeEvent).toHaveBeenCalledWith(
      firstParticipant,
      firstState[EScheme.ANIMPOINT],
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
    expect(manager.storyManager.registerObject).toHaveBeenCalledWith(firstParticipant.id());

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
      firstParticipant,
      firstState[EScheme.ANIMPOINT],
      ESchemeEvent.UPDATE,
      -1
    );
    expect(firstState.camp).toBe(object.id());
    expect(secondState.camp).toBe(object.id());
    expect(manager.storyManager.registerObject).toHaveBeenCalledWith(secondParticipant.id());

    manager.unregisterObject(firstParticipant.id());
    manager.unregisterObject(secondParticipant.id());

    expect(manager.storyManager.unregisterObject).toHaveBeenCalledWith(firstParticipant.id());
    expect(manager.storyManager.unregisterObject).toHaveBeenCalledWith(secondParticipant.id());
    expect(firstState.camp).toBeNull();
    expect(secondState.camp).toBeNull();
    expect(manager.objects).toEqualLuaArrays([]);
  });

  it("should correctly register/unregister objects with guitar activity", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: CampManager = new CampManager(object, MockIniFile.mock("test.ltx"));

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
    firstState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      approvedActions: MockLuaTable.mock(),
    });
    secondState.activeScheme = EScheme.ANIMPOINT;
    secondState[EScheme.ANIMPOINT] = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      description: EStalkerState.SIT_ASS,
      approvedActions: $fromArray<IAnimpointActionDescriptor>([{ name: EStalkerState.SIT_ASS, predicate: () => true }]),
    });

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
