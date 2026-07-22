import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { getManager, registerObject } from "@/engine/core/database";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryPlaybackController } from "@/engine/core/managers/sounds/stories/StoryPlaybackController";
import { resetRegistry } from "@/fixtures/engine";

describe("StoryPlaybackController", () => {
  beforeEach(() => {
    resetRegistry();
    soundsConfig.playing = new LuaTable();
  });

  it("should initialize with no active story or participants", () => {
    const controller: StoryPlaybackController = new StoryPlaybackController("test-story");

    expect(controller.id).toBe("test-story");
    expect(controller.objects).toEqualLuaTables({});
    expect(controller.storyteller).toBeNull();
    expect(controller.story).toBeNull();
    expect(controller.lastPlayingObjectId).toBeNull();
    expect(controller.phraseTimeout).toBeNull();
    expect(controller.phraseIdle).toBe(0);
  });

  it("should add participants and cancel playback when the active speaker leaves", () => {
    const controller: StoryPlaybackController = new StoryPlaybackController("test-story");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const playing = { stop: jest.fn() } as unknown as AbstractPlayableSound;

    controller.registerObject(first.id());
    controller.registerObject(second.id());
    controller.setStoryTeller(first.id());
    controller.setActiveStory("first");
    controller.lastPlayingObjectId = first.id();
    soundsConfig.playing.set(first.id(), playing);

    controller.unregisterObject(first.id());

    expect(controller.objects).toEqualLuaTables({ 1: { objectId: second.id() } });
    expect(controller.storyteller).toBeNull();
    expect(controller.story).toBeNull();
    expect(playing.stop).toHaveBeenCalledWith(first.id());
  });

  it("should play the next teller phrase after its idle interval", () => {
    const controller: StoryPlaybackController = new StoryPlaybackController("test-story");
    const speaker: GameObject = MockGameObject.mock();
    const manager: SoundManager = getManager(SoundManager);

    registerObject(speaker);
    controller.registerObject(speaker.id());
    controller.setActiveStory("first");
    replaceFunctionMock(time_global, () => 100);
    jest.spyOn(manager, "play").mockReturnValue(null);

    controller.update();

    expect(controller.storyteller).toBe(speaker.id());
    expect(controller.lastPlayingObjectId).toBe(speaker.id());
    expect(controller.phraseTimeout).toBeNull();
    expect(controller.phraseIdle).toBe(1_000_000);
    expect(manager.play).toHaveBeenCalledWith(speaker.id(), "theme-1");
  });

  it("should correctly check finished state", () => {
    const manager: StoryPlaybackController = new StoryPlaybackController("test-story");

    expect(manager.isFinished()).toBe(true);

    manager.setActiveStory("empty-story");
    expect(manager.isFinished()).toBe(true);

    manager.setActiveStory("first");
    expect(manager.isFinished()).toBe(false);
  });
});
