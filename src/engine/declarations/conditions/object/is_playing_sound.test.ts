import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMockOnce } from "xray16/testing/utils";

import { isPlayingSound } from "@/engine/core/utils/sound";
import { callXrCondition } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/sound");
beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_playing_sound");
});

describe("is_playing_sound", () => {
  it("should check if object is playing sound", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMockOnce(isPlayingSound, () => true);
    expect(callXrCondition("is_playing_sound", MockGameObject.mockActor(), object)).toBe(true);

    replaceFunctionMockOnce(isPlayingSound, () => false);
    expect(callXrCondition("is_playing_sound", MockGameObject.mockActor(), object)).toBe(false);
  });
});
