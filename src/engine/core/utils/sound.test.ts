import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { get_console, snd_type } from "xray16";

import { LoopedSound } from "@/engine/core/managers/sounds/objects";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import {
  getEffectsVolume,
  getMusicVolume,
  isPlayingSound,
  isSoundType,
  mapSoundMaskToSoundType,
  setEffectsVolume,
  setMusicVolume,
  stopPlayingObjectSound,
} from "@/engine/core/utils/sound";
import { ESoundType } from "@/engine/lib/constants/sound";
import { Console, GameObject } from "@/engine/lib/types";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("getMusicVolume util", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetFunctionMock(console.get_float);
  });

  it("should correctly execute console commands", () => {
    jest.spyOn(console, "get_float").mockImplementation(() => 1);
    expect(getMusicVolume()).toBe(1);

    jest.spyOn(console, "get_float").mockImplementation(() => 0.25);
    expect(getMusicVolume()).toBe(0.25);

    expect(console.get_float).toHaveBeenCalledWith("snd_volume_music");
  });
});

describe("getEffectsVolume util", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetFunctionMock(console.get_float);
  });

  it("should correctly execute console commands", () => {
    jest.spyOn(console, "get_float").mockImplementation(() => 1);
    expect(getEffectsVolume()).toBe(1);

    jest.spyOn(console, "get_float").mockImplementation(() => 0.25);
    expect(getEffectsVolume()).toBe(0.25);

    expect(console.get_float).toHaveBeenCalledWith("snd_volume_eff");
  });
});

describe("setMusicVolume util", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetFunctionMock(console.execute);
  });

  it("should correctly execute console commands", () => {
    setMusicVolume(1);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 1");

    setMusicVolume(0.5);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0.5");

    setMusicVolume(0);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0");
  });
});

describe("setEffectsVolume util", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetFunctionMock(console.execute);
  });

  it("should correctly execute console commands", () => {
    setEffectsVolume(1);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_eff 1");

    setEffectsVolume(0.5);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_eff 0.5");

    setEffectsVolume(0);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_eff 0");
  });
});

describe("mapSoundMaskToSoundType util", () => {
  it("should correctly convert mask to enum", () => {
    expect(mapSoundMaskToSoundType(snd_type.weapon)).toBe(ESoundType.WPN);
    expect(mapSoundMaskToSoundType(snd_type.weapon_shoot)).toBe(ESoundType.WPN_shoot);
    expect(mapSoundMaskToSoundType(snd_type.weapon_empty)).toBe(ESoundType.WPN_empty);
    expect(mapSoundMaskToSoundType(snd_type.weapon_reload)).toBe(ESoundType.WPN_reload);
    expect(mapSoundMaskToSoundType(snd_type.weapon_bullet_hit)).toBe(ESoundType.WPN_hit);

    expect(mapSoundMaskToSoundType(snd_type.item)).toBe(ESoundType.ITM);
    expect(mapSoundMaskToSoundType(snd_type.item_drop)).toBe(ESoundType.ITM_drop);
    expect(mapSoundMaskToSoundType(snd_type.item_pick_up)).toBe(ESoundType.ITM_pckup);
    expect(mapSoundMaskToSoundType(snd_type.item_use)).toBe(ESoundType.ITM_use);
    expect(mapSoundMaskToSoundType(snd_type.item_hide)).toBe(ESoundType.ITM_hide);
    expect(mapSoundMaskToSoundType(snd_type.item_take)).toBe(ESoundType.ITM_take);

    expect(mapSoundMaskToSoundType(snd_type.monster)).toBe(ESoundType.MST);
    expect(mapSoundMaskToSoundType(snd_type.monster_die)).toBe(ESoundType.MST_die);
    expect(mapSoundMaskToSoundType(snd_type.monster_attack)).toBe(ESoundType.MST_attack);
    expect(mapSoundMaskToSoundType(snd_type.monster_eat)).toBe(ESoundType.MST_eat);
    expect(mapSoundMaskToSoundType(snd_type.monster_step)).toBe(ESoundType.MST_step);
    expect(mapSoundMaskToSoundType(snd_type.monster_talk)).toBe(ESoundType.MST_talk);
    expect(mapSoundMaskToSoundType(snd_type.monster_injure)).toBe(ESoundType.MST_damage);

    expect(mapSoundMaskToSoundType(snd_type.ambient)).toBe(ESoundType.NIL);
    expect(mapSoundMaskToSoundType(snd_type.anomaly_idle)).toBe(ESoundType.NIL);
    expect(mapSoundMaskToSoundType(snd_type.hide)).toBe(ESoundType.NIL);
  });
});

describe("isSoundType util", () => {
  it("should correctly check if sound is matching", () => {
    expect(isSoundType(snd_type.item_drop, snd_type.item_drop)).toBeTruthy();
    expect(isSoundType(snd_type.item_drop, snd_type.item)).toBeTruthy();
    expect(isSoundType(snd_type.item_pick_up, snd_type.item)).toBeTruthy();
    expect(isSoundType(snd_type.weapon, snd_type.weapon)).toBeTruthy();
    expect(isSoundType(snd_type.weapon_shoot, snd_type.weapon)).toBeTruthy();
    expect(isSoundType(snd_type.weapon_empty, snd_type.weapon)).toBeTruthy();

    expect(isSoundType(snd_type.weapon_shoot, snd_type.item_drop)).toBeFalsy();
    expect(isSoundType(snd_type.weapon_empty, snd_type.item)).toBeFalsy();
    expect(isSoundType(snd_type.bullet_hit, snd_type.item)).toBeFalsy();
    expect(isSoundType(snd_type.item, snd_type.weapon)).toBeFalsy();
    expect(isSoundType(snd_type.item_pick_up, snd_type.weapon)).toBeFalsy();
    expect(isSoundType(snd_type.ambient, snd_type.weapon)).toBeFalsy();
  });
});

describe("stopPlayingObjectSound util", () => {
  it("should correctly reset object sound play", () => {
    const object: GameObject = MockGameObject.mock();

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

describe("isPlayingSound util", () => {
  it("should correctly check sound play state", () => {
    const object: GameObject = MockGameObject.mock();

    expect(isPlayingSound(object)).toBe(false);

    soundsConfig.playing.set(
      object.id(),
      new LoopedSound(
        MockIniFile.mock("test.ltx", {
          test: {
            path: "test_sound.ogg",
          },
        }),
        "test"
      )
    );
    expect(isPlayingSound(object)).toBe(true);
  });
});
