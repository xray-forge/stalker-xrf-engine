import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { registerObject } from "@/engine/core/database";
import { LoopedSound } from "@/engine/core/managers/sounds/objects/LoopedSound";
import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { resetRegistry } from "@/fixtures/engine";

describe("LoopedSound", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should initialize from its configured path", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", { test_looped: { path: "some/looped/path" } });
    const sound: LoopedSound = new LoopedSound(ini, "test_looped");

    expect(sound.type).toBe(EPlayableSound.LOOPED);
    expect(sound.section).toBe("test_looped");
    expect(sound.path).toBe("some/looped/path");
    expect(sound.soundObjects).toEqualLuaTables({});
  });

  it("should play and stop independently for each registered object", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", { test_looped: { path: "some/looped/path" } });
    const sound: LoopedSound = new LoopedSound(ini, "test_looped");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerObject(first);
    registerObject(second);

    expect(sound.play(first.id())).toBe(true);
    expect(sound.play(second.id())).toBe(true);

    const firstSound = sound.soundObjects.get(first.id());
    const secondSound = sound.soundObjects.get(second.id());

    replaceFunctionMock(firstSound!.playing, () => true);
    replaceFunctionMock(secondSound!.playing, () => true);

    expect(sound.isPlaying(first.id())).toBe(true);
    expect(sound.isPlaying(second.id())).toBe(true);

    sound.setVolumeForObject(first.id(), 0.4);
    sound.stop(first.id());

    expect(firstSound?.volume).toBe(0.4);
    expect(firstSound?.stop).toHaveBeenCalledTimes(1);
    expect(sound.soundObjects.get(first.id())).toBeNull();
    expect(secondSound?.stop).not.toHaveBeenCalled();
    expect(sound.isPlaying(second.id())).toBe(true);
  });
});
