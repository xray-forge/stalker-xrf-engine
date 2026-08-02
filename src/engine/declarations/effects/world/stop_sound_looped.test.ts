import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/stop_sound_looped");
});

beforeEach(() => {
  resetRegistry();
});

describe("stop_sound_looped", () => {
  it("should stop looped sounds", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(soundManager, "stopAllLooped").mockImplementation(jest.fn());

    callXrEffect("stop_sound_looped", MockGameObject.mockActor(), object);

    expect(soundManager.stopAllLooped).toHaveBeenCalledTimes(1);
    expect(soundManager.stopAllLooped).toHaveBeenCalledWith(object.id());
  });
});
