import { describe, expect, it, jest } from "@jest/globals";

import { getObjectCampActivityRole, startPlayingGuitar, startPlayingHarmonica } from "@/engine/core/ai/camp/camp_utils";
import { CampManager, EObjectCampActivity, EObjectCampRole } from "@/engine/core/ai/camp/index";
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
    const campManager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(campManager.storyManager, "setStoryTeller").mockImplementation(jest.fn());
    jest.spyOn(campManager.storyManager, "setActiveStory").mockImplementation(jest.fn());
    jest.spyOn(campManager.storyManager, "update").mockImplementation(jest.fn());

    state.camp = camp.id();

    campManager.directorId = 450;

    registerCampZone(camp, campManager);
    startPlayingGuitar(object);

    expect(campManager.storyManager.setStoryTeller).toHaveBeenCalledWith(450);
    expect(campManager.storyManager.setActiveStory).toHaveBeenCalledWith("test_guitar");
    expect(campManager.storyManager.update).toHaveBeenCalledTimes(1);
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
    const campManager: CampManager = new CampManager(camp, MockIniFile.mock("test.ltx"));
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(campManager.storyManager, "setStoryTeller").mockImplementation(jest.fn());
    jest.spyOn(campManager.storyManager, "setActiveStory").mockImplementation(jest.fn());
    jest.spyOn(campManager.storyManager, "update").mockImplementation(jest.fn());

    state.camp = camp.id();

    campManager.directorId = 450;

    registerCampZone(camp, campManager);
    startPlayingHarmonica(object);

    expect(campManager.storyManager.setStoryTeller).toHaveBeenCalledWith(450);
    expect(campManager.storyManager.setActiveStory).toHaveBeenCalledWith("test_harmonica");
    expect(campManager.storyManager.update).toHaveBeenCalledTimes(1);
  });

  it.todo("canTellCampStory should correctly check");

  it.todo("canPlayCampGuitar should correctly check");

  it.todo("canPlayCampHarmonica should correctly check");

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
