import { describe, expect, it, jest } from "@jest/globals";

import { startPlayingGuitar, startPlayingHarmonica } from "@/engine/core/ai/camp/camp_utils";
import { CampManager } from "@/engine/core/ai/camp/index";
import { IRegistryObjectState, registerCampZone, registerObject, registry } from "@/engine/core/database";
import { GameObject } from "@/engine/lib/types";
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
});
