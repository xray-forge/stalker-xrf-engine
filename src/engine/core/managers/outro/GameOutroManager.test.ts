import { beforeEach, describe, expect, it } from "@jest/globals";
import { game, sound_object } from "xray16";

import { getManager } from "@/engine/core/database";
import { GameOutroManager } from "@/engine/core/managers/outro/GameOutroManager";
import { ESoundObjectType, SoundObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockSoundObject } from "@/fixtures/xray";

describe("GameOutroManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly start ending tutorial", () => {
    const gameOutroManager: GameOutroManager = getManager(GameOutroManager);

    gameOutroManager.startOutro();

    expect(game.start_tutorial).toHaveBeenCalledWith("outro_game");
  });

  it("should correctly start outro sound", () => {
    const gameOutroManager: GameOutroManager = getManager(GameOutroManager);

    expect(gameOutroManager.sound).toBeNull();

    gameOutroManager.startSound();

    expect(gameOutroManager.sound).toBeInstanceOf(sound_object);
    expect(gameOutroManager.sound?.play).toHaveBeenCalledTimes(1);
    expect(gameOutroManager.sound?.play).toHaveBeenCalledWith(null, 0.0, ESoundObjectType.S2D);
    expect(gameOutroManager.sound?.volume).toBe(1);
    expect((gameOutroManager.sound as unknown as MockSoundObject).path).toBe("music_outro");
  });

  it("should correctly stop outro sound", () => {
    const gameOutroManager: GameOutroManager = getManager(GameOutroManager);

    expect(gameOutroManager.sound).toBeNull();

    gameOutroManager.startSound();

    const sound: SoundObject = gameOutroManager.sound as SoundObject;

    gameOutroManager.stopSound();

    expect(gameOutroManager.sound).toBeNull();
    expect(sound.stop).toHaveBeenCalledTimes(1);
  });

  it.todo("should correctly start black screen and sound");

  it.todo("should correctly stop black screen and sound");

  it.todo("should correctly update black screen and sound fade start");

  it.todo("should correctly update black screen and sound fade stop");
});
