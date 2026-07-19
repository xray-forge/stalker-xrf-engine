import { describe, expect, it } from "@jest/globals";

import { StoryPlaybackController } from "@/engine/core/managers/sounds/stories/StoryPlaybackController";

describe("StoryPlaybackController", () => {
  it.todo("should correctly initialize");

  it.todo("should correctly add/remove participants");

  it.todo("should correctly handle update event");

  it("should correctly check finished state", () => {
    const manager: StoryPlaybackController = new StoryPlaybackController("test-story");

    expect(manager.isFinished()).toBe(true);

    manager.setActiveStory("empty-story");
    expect(manager.isFinished()).toBe(true);

    manager.setActiveStory("first");
    expect(manager.isFinished()).toBe(false);
  });
});
