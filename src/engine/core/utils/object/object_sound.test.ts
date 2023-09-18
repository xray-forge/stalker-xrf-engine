import { describe, expect, it } from "@jest/globals";

import { stopPlayingObjectSound } from "@/engine/core/utils/object/object_sound";
import { ClientObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";

describe("object_sound utils", () => {
  it("'stopPlayingObjectSound' should correctly reset object sound play", () => {
    const object: ClientObject = mockClientGameObject();

    replaceFunctionMock(object.alive, () => false);
    stopPlayingObjectSound(object);
    expect(object.set_sound_mask).not.toHaveBeenCalled();

    replaceFunctionMock(object.alive, () => true);
    stopPlayingObjectSound(object);
    expect(object.set_sound_mask).toHaveBeenCalledTimes(2);
    expect(object.set_sound_mask).toHaveBeenNthCalledWith(1, -1);
    expect(object.set_sound_mask).toHaveBeenNthCalledWith(2, 0);
  });
});
