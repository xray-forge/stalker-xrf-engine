import { describe, expect, it, jest } from "@jest/globals";
import { IniFile } from "xray16/alias";

import { ObjectSound } from "@/engine/core/managers/sounds/objects/ObjectSound";
import { MockIniFile } from "@/fixtures/xray";

describe("ObjectSound", () => {
  it.todo("should correctly initialize");

  it.todo("should correctly initialize object");

  it("should correctly select next random sound excluding the previously played index", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", { test_object_sound: { path: "some/path" } });
    const sound: ObjectSound = new ObjectSound(ini, "test_object_sound");

    sound.soundPaths.set(2, "some/path2");
    sound.soundPaths.set(3, "some/path3");
    sound.soundPaths.set(4, "some/path4");
    sound.soundPaths.set(5, "some/path5");

    const randomSpy = jest.spyOn(math, "random");

    sound.playedSoundIndex = null;
    randomSpy.mockReturnValueOnce(5);
    expect(sound.selectNextSound()).toBe(5);

    sound.playedSoundIndex = 2;

    randomSpy.mockReturnValueOnce(1);
    expect(sound.selectNextSound()).toBe(1); // 1 < 2 -> unchanged

    randomSpy.mockReturnValueOnce(2);
    expect(sound.selectNextSound()).toBe(3); // draw == previous -> shifted up (never repeats)

    randomSpy.mockReturnValueOnce(4);
    expect(sound.selectNextSound()).toBe(5);

    randomSpy.mockRestore();
  });

  it.todo("should correctly handle sound play end");

  it.todo("should correctly play/stop");

  it.todo("should correctly reset");

  it.todo("should correctly save/load");
});
