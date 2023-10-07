import { describe, expect, it } from "@jest/globals";
import { snd_type } from "xray16";

import { registry } from "@/engine/core/database";
import { LoopedSound } from "@/engine/core/managers/sounds/objects";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import {
  isPlayingSound,
  isSoundType,
  mapSoundMaskToSoundType,
  stopPlayingObjectSound,
} from "@/engine/core/utils/sound";
import { ESoundType } from "@/engine/lib/constants/sound";
import { ClientObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("sound utils", () => {
  it("mapSoundMaskToSoundType should correctly convert mask to enum", () => {
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

  it("isSoundType should correctly check if sound is matching", () => {
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

  it("stopPlayingObjectSound should correctly reset object sound play", () => {
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

  it("isPlayingSound should correctly check sound play state", () => {
    const object: ClientObject = mockClientGameObject();

    expect(isPlayingSound(object)).toBe(false);

    soundsConfig.playing.set(
      object.id(),
      new LoopedSound(
        mockIniFile("test.ltx", {
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
