import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, SoundObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { callXrEffect, mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/play_sound");
});

beforeEach(() => {
  resetRegistry();
});

describe("play_sound", () => {
  it("should force play sounds", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const terrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null as unknown as SoundObject));

    callXrEffect("play_sound", actorGameObject, object, "test_theme", "test_faction", terrain.name());

    expect(soundManager.play).toHaveBeenCalledTimes(1);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test_theme", "test_faction", terrain.id);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(() => {
      callXrEffect("play_sound", actorGameObject, object, "test_theme", "test_faction", terrain.name());
    }).toThrow(`Stalker '${object.name()}' is dead while trying to play theme sound 'test_theme'.`);
  });
});
