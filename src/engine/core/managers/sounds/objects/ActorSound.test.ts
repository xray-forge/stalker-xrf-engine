import { describe, expect, it, jest } from "@jest/globals";
import { IniFile } from "xray16/alias";

import { ActorSound } from "@/engine/core/managers/sounds/objects/ActorSound";
import { MockIniFile } from "@/fixtures/xray";

describe("ActorSound", () => {
  it.todo("should correctly initialize");

  it.todo("should correctly play");

  it.todo("should correctly handle play end event");

  it.todo("should correctly reset");

  it("should correctly select next random sound excluding the previously played index", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", { test_actor_sound: { path: "some/path" } });
    const sound: ActorSound = new ActorSound(ini, "test_actor_sound");

    // Constructor sets soundPaths = { 1 }; extend to a 1-based collection of 5.
    sound.soundPaths.set(2, "some/path2");
    sound.soundPaths.set(3, "some/path3");
    sound.soundPaths.set(4, "some/path4");
    sound.soundPaths.set(5, "some/path5");

    const randomSpy = jest.spyOn(math, "random");

    sound.playedSoundIndex = null;
    randomSpy.mockReturnValueOnce(5);
    expect(sound.selectNextSound()).toBe(5);

    // Subsequent plays draw over 1..count-1 and shift up when the draw is >= the previous index.
    sound.playedSoundIndex = 2;

    randomSpy.mockReturnValueOnce(1);
    expect(sound.selectNextSound()).toBe(1); // 1 < 2 -> unchanged

    randomSpy.mockReturnValueOnce(2);
    expect(sound.selectNextSound()).toBe(3); // draw == previous -> shifted up (never repeats)

    randomSpy.mockReturnValueOnce(4);
    expect(sound.selectNextSound()).toBe(5);

    randomSpy.mockRestore();
  });

  it.todo("should correctly save/load");
});
