import { bit_and, snd_type, TXR_snd_type } from "xray16";

import { ESoundType } from "@/engine/lib/constants/sound/sound_type";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

export function mapSndTypeToSoundType(sound_type: TXR_snd_type): ESoundType {
  if (bit_and(sound_type, snd_type.weapon) === snd_type.weapon) {
    if (bit_and(sound_type, snd_type.weapon_shoot) === snd_type.weapon_shoot) {
      return ESoundType.WPN_shoot;
    } else if (bit_and(sound_type, snd_type.weapon_empty) === snd_type.weapon_empty) {
      return ESoundType.WPN_empty;
    } else if (bit_and(sound_type, snd_type.weapon_bullet_hit) === snd_type.weapon_bullet_hit) {
      return ESoundType.WPN_hit;
    } else if (bit_and(sound_type, snd_type.weapon_reload) === snd_type.weapon_reload) {
      return ESoundType.WPN_reload;
    } else {
      return ESoundType.WPN;
    }
  } else if (bit_and(sound_type, snd_type.item) === snd_type.item) {
    if (bit_and(sound_type, snd_type.item_pick_up) === snd_type.item_pick_up) {
      return ESoundType.ITM_pckup;
    } else if (bit_and(sound_type, snd_type.item_drop) === snd_type.item_drop) {
      return ESoundType.ITM_drop;
    } else if (bit_and(sound_type, snd_type.item_hide) === snd_type.item_hide) {
      return ESoundType.ITM_hide;
    } else if (bit_and(sound_type, snd_type.item_take) === snd_type.item_take) {
      return ESoundType.ITM_take;
    } else if (bit_and(sound_type, snd_type.item_use) === snd_type.item_use) {
      return ESoundType.ITM_use;
    } else {
      return ESoundType.ITM;
    }
  } else if (bit_and(sound_type, snd_type.monster) === snd_type.monster) {
    if (bit_and(sound_type, snd_type.monster_die) === snd_type.monster_die) {
      return ESoundType.MST_die;
    } else if (bit_and(sound_type, snd_type.monster_injure) === snd_type.monster_injure) {
      return ESoundType.MST_damage;
    } else if (bit_and(sound_type, snd_type.monster_step) === snd_type.monster_step) {
      return ESoundType.MST_step;
    } else if (bit_and(sound_type, snd_type.monster_talk) === snd_type.monster_talk) {
      return ESoundType.MST_talk;
    } else if (bit_and(sound_type, snd_type.monster_attack) === snd_type.monster_attack) {
      return ESoundType.MST_attack;
    } else if (bit_and(sound_type, snd_type.monster_eat) === snd_type.monster_eat) {
      return ESoundType.MST_eat;
    } else {
      return ESoundType.MST;
    }
  }

  return ESoundType.NIL;
}
