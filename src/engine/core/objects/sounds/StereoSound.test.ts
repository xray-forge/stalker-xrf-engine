import { describe, expect, it, jest } from "@jest/globals";
import { sound_object, time_global } from "xray16";

import { registerActor } from "@/engine/core/database";
import { StereoSound } from "@/engine/core/objects/sounds/StereoSound";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject } from "@/fixtures/xray";

describe("StereoSound class", () => {
  it("should correctly initialize", () => {
    const stereoSound: StereoSound = new StereoSound();

    jest.spyOn(stereoSound, "stop");

    expect(stereoSound.soundPath).toBeNull();
    expect(stereoSound.soundObject).toBeNull();
    expect(stereoSound.soundEndTime).toBeNull();

    expect(stereoSound.isPlaying()).toBe(false);

    stereoSound.initialize("test/path/file.ogg", 50);

    const previous: sound_object = stereoSound.soundObject as sound_object;

    expect(stereoSound.isPlaying()).toBe(false);
    expect(stereoSound.soundObject).toBeDefined();
    expect(stereoSound.soundObject?.volume).toBe(50);
    expect(stereoSound.soundObject?.play).not.toHaveBeenCalled();
    expect(stereoSound.soundObject?.stop).not.toHaveBeenCalled();
    expect(stereoSound.isPlaying()).toBe(false);

    stereoSound.initialize("test/path/another.ogg", 25);

    expect(stereoSound.soundObject?.volume).toBe(25);
    expect(stereoSound.soundObject?.play).not.toHaveBeenCalled();
    expect(stereoSound.soundObject?.stop).not.toHaveBeenCalled();

    expect(previous.stop).not.toHaveBeenCalled();
    expect(stereoSound.stop).toHaveBeenCalled();
  });

  it("should correctly start and stop playing", () => {
    const stereoSound: StereoSound = new StereoSound();

    jest.spyOn(stereoSound, "setVolume");
    replaceFunctionMock(time_global, () => 70);

    expect(() => stereoSound.play()).toThrow();

    stereoSound.initialize("test/path/file.ogg", 50);

    expect(() => stereoSound.play()).toThrow();

    registerActor(mockClientGameObject());

    stereoSound.update(50);

    expect(stereoSound.setVolume).not.toHaveBeenCalled();

    expect(stereoSound.play()).toBe(100);
    expect(stereoSound.soundEndTime).toBe(100);
    expect(stereoSound.isPlaying()).toBe(true);

    stereoSound.setVolume(14);
    expect(stereoSound.soundObject?.volume).toBe(14);

    stereoSound.setVolume(23);
    expect(stereoSound.soundObject?.volume).toBe(23);

    stereoSound.update(50);
    expect(stereoSound.soundObject?.volume).toBe(50);
    expect(stereoSound.setVolume).toHaveBeenCalledTimes(3);

    stereoSound.stop();
    stereoSound.stop();

    expect(stereoSound.isPlaying()).toBe(false);
    expect(stereoSound.soundObject?.stop).toHaveBeenCalledTimes(1);

    expect(stereoSound.playAtTime(250, "test/next.ogg", 70)).toBe(280);
    expect(stereoSound.soundObject?.attach_tail).toHaveBeenCalledWith("test/next.ogg");
    expect(stereoSound.soundEndTime).toBe(280);
    expect(stereoSound.soundObject?.volume).toBe(70);
  });

  it.todo("should correctly play at time");

  it.todo("should correctly check play state");
});
