import { beforeEach, describe, expect, it } from "@jest/globals";

import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryPlaybackController } from "@/engine/core/managers/sounds/stories";
import { getStoryPlayback } from "@/engine/core/managers/sounds/utils/sounds_stories";

describe("getStoryPlayback util", () => {
  beforeEach(() => {
    soundsConfig.storyPlaybacks = new LuaTable();
  });

  it("should correctly get singleton for provided ID", () => {
    expect(soundsConfig.storyPlaybacks.length()).toBe(0);

    const manager: StoryPlaybackController = getStoryPlayback("test_id_1");

    expect(soundsConfig.storyPlaybacks.length()).toBe(1);
    expect(manager).toBeInstanceOf(StoryPlaybackController);
    expect(manager).toBe(getStoryPlayback("test_id_1"));
    expect(soundsConfig.storyPlaybacks.length()).toBe(1);
    expect(manager).not.toBe(getStoryPlayback("test_id_2"));
    expect(soundsConfig.storyPlaybacks.length()).toBe(2);
  });
});
