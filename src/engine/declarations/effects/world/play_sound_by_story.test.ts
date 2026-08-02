import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, SoundObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { getManager, registerStoryLink } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { callXrEffect, mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/play_sound_by_story");
});

beforeEach(() => {
  resetRegistry();
});

describe("play_sound_by_story", () => {
  it("should play sound by story id", () => {
    const { actorGameObject } = mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
    const soundManager: SoundManager = getManager(SoundManager);
    const terrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null as unknown as SoundObject));

    registerStoryLink(object.id(), "test-sid");

    callXrEffect(
      "play_sound_by_story",
      actorGameObject,
      object,
      "test-sid",
      "test-theme",
      "test-faction",
      terrain.name()
    );

    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test-theme", "test-faction", terrain.id);
  });
});
