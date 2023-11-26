import { beforeEach, describe, expect, it } from "@jest/globals";

import { CampManager } from "@/engine/core/ai/camp/CampManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { getStoryManager } from "@/engine/core/managers/sounds/utils";
import { GameObject, IniFile } from "@/engine/lib/types";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

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

  it.todo("should correctly get camp action");

  it.todo("should correctly register/unregister objects");

  it.todo("should correctly get object roles");
});
