import { beforeEach, describe, expect, it } from "@jest/globals";

import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { getStoryManager } from "@/engine/core/managers/sounds/utils/sounds_stories";

describe("getStoryManager util", () => {
  beforeEach(() => {
    soundsConfig.managers = new LuaTable();
  });

  it("should correctly get singleton for provided ID", () => {
    expect(soundsConfig.managers.length()).toBe(0);

    const manager: StoryManager = getStoryManager("test_id_1");

    expect(soundsConfig.managers.length()).toBe(1);
    expect(manager).toBeInstanceOf(StoryManager);
    expect(manager).toBe(getStoryManager("test_id_1"));
    expect(soundsConfig.managers.length()).toBe(1);
    expect(manager).not.toBe(getStoryManager("test_id_2"));
    expect(soundsConfig.managers.length()).toBe(2);
  });
});
