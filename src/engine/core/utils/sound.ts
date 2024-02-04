import { bit_and, get_console, snd_type } from "xray16";

import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { ESoundType } from "@/engine/lib/constants/sound";
import { GameObject, TRate, TSoundType } from "@/engine/lib/types";

/**
 * @returns currently set music volume
 */
export function getMusicVolume(): TRate {
  return get_console().get_float(consoleCommands.snd_volume_music);
}

/**
 * @returns currently set effects volume
 */
export function getEffectsVolume(): TRate {
  return get_console().get_float(consoleCommands.snd_volume_eff);
}

/**
 * @param volume - rate to set music volume
 */
export function setMusicVolume(volume: TRate): void {
  get_console().execute(string.format("%s %s", consoleCommands.snd_volume_music, volume));
}

/**
 * @param volume - rate to set effects volume
 */
export function setEffectsVolume(volume: TRate): void {
  get_console().execute(string.format("%s %s", consoleCommands.snd_volume_eff, volume));
}

/**
 * Check whether sound is included in actual sound bit mask.
 *
 * @param heard - actual heard sound bit mask
 * @param expected - sound to check containing in the mask
 * @returns whether expected sound type is provided
 */
export function isSoundType(heard: TSoundType, expected: TSoundType): boolean {
  return bit_and(heard, expected) === expected;
}

/**
 * Check whether is playing sound.
 *
 * @param object - game object to check playing
 * @returns whether currently sound is playing
 */
export function isPlayingSound(object: GameObject): boolean {
  return soundsConfig.playing.has(object.id());
}

/**
 * Stop playing sound for client game object.
 *
 * @param object - target object to stop playing
 */
export function stopPlayingObjectSound(object: GameObject): void {
  if (object.alive()) {
    object.set_sound_mask(-1);
    object.set_sound_mask(0);
  }
}

/**
 * Transforms heard sound type from mask value to specific enum.
 *
 * @param soundMask - heard sound mask
 * @returns transformed mask to enum value
 */
export function mapSoundMaskToSoundType(soundMask: TSoundType): ESoundType {
  if (bit_and(soundMask, snd_type.weapon) === snd_type.weapon) {
    if (bit_and(soundMask, snd_type.weapon_shoot) === snd_type.weapon_shoot) {
      return ESoundType.WPN_shoot;
    } else if (bit_and(soundMask, snd_type.weapon_empty) === snd_type.weapon_empty) {
      return ESoundType.WPN_empty;
    } else if (bit_and(soundMask, snd_type.weapon_bullet_hit) === snd_type.weapon_bullet_hit) {
      return ESoundType.WPN_hit;
    } else if (bit_and(soundMask, snd_type.weapon_reload) === snd_type.weapon_reload) {
      return ESoundType.WPN_reload;
    } else {
      return ESoundType.WPN;
    }
  } else if (bit_and(soundMask, snd_type.item) === snd_type.item) {
    if (bit_and(soundMask, snd_type.item_pick_up) === snd_type.item_pick_up) {
      return ESoundType.ITM_pckup;
    } else if (bit_and(soundMask, snd_type.item_drop) === snd_type.item_drop) {
      return ESoundType.ITM_drop;
    } else if (bit_and(soundMask, snd_type.item_hide) === snd_type.item_hide) {
      return ESoundType.ITM_hide;
    } else if (bit_and(soundMask, snd_type.item_take) === snd_type.item_take) {
      return ESoundType.ITM_take;
    } else if (bit_and(soundMask, snd_type.item_use) === snd_type.item_use) {
      return ESoundType.ITM_use;
    } else {
      return ESoundType.ITM;
    }
  } else if (bit_and(soundMask, snd_type.monster) === snd_type.monster) {
    if (bit_and(soundMask, snd_type.monster_die) === snd_type.monster_die) {
      return ESoundType.MST_die;
    } else if (bit_and(soundMask, snd_type.monster_injure) === snd_type.monster_injure) {
      return ESoundType.MST_damage;
    } else if (bit_and(soundMask, snd_type.monster_step) === snd_type.monster_step) {
      return ESoundType.MST_step;
    } else if (bit_and(soundMask, snd_type.monster_talk) === snd_type.monster_talk) {
      return ESoundType.MST_talk;
    } else if (bit_and(soundMask, snd_type.monster_attack) === snd_type.monster_attack) {
      return ESoundType.MST_attack;
    } else if (bit_and(soundMask, snd_type.monster_eat) === snd_type.monster_eat) {
      return ESoundType.MST_eat;
    } else {
      return ESoundType.MST;
    }
  }

  return ESoundType.NIL;
}
