import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { soundsConfig } from "@/engine/core/managers/sounds";
import { LoopedSound } from "@/engine/core/managers/sounds/objects";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/reset_sound_npc");
});

describe("reset_sound_npc", () => {
  it("should reset sound", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("reset_sound_npc", MockGameObject.mockActor(), object);
    expect(soundsConfig.playing.length()).toBe(0);

    const sound: LoopedSound = new LoopedSound(
      MockIniFile.mock("test.ltx", {
        test: {
          path: "testing.ltx",
        },
      }),
      "test"
    );

    soundsConfig.playing.set(object.id(), sound);
    jest.spyOn(sound, "reset").mockImplementation(() => {});

    callXrEffect("reset_sound_npc", MockGameObject.mockActor(), object);

    expect(sound.reset).toHaveBeenCalledWith(object.id());
  });
});
