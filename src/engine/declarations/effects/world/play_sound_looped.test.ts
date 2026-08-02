import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/play_sound_looped");
});

beforeEach(() => {
  resetRegistry();
});

describe("play_sound_looped", () => {
  it("should play looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "playLooped").mockImplementation(jest.fn());

    callXrEffect("play_sound_looped", MockGameObject.mockActor(), object, "test_sound");

    expect(soundManager.playLooped).toHaveBeenCalledTimes(1);
    expect(soundManager.playLooped).toHaveBeenCalledWith(object.id(), "test_sound");
  });
});
