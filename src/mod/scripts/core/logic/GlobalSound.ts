import { XR_net_packet, XR_reader, XR_sound_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { sound_themes } from "@/mod/scripts/core/db";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { LoopedSound } from "@/mod/scripts/core/sound/playable_sounds/LoopedSound";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("GlobalSound");

export class GlobalSound {
  public static sound_table: LuaTable<number, AbstractPlayableSound> = new LuaTable();
  public static looped_sound: LuaTable<number, LuaTable<string, AbstractPlayableSound>> = new LuaTable();

  public static set_sound_play(
    objectId: number,
    sound: Optional<string>,
    faction: Optional<string>,
    point: Optional<number>
  ): Optional<XR_sound_object> {
    logger.info("Set sound play:", objectId);

    if (sound === null) {
      return null;
    }

    const playableSound: Optional<AbstractPlayableSound> = sound_themes.get(sound);

    if (playableSound === null) {
      abort("set_sound_play. Wrong sound theme [%s], npc[%s]", tostring(sound), objectId);
    }

    if (playableSound.type === LoopedSound.type) {
      abort("You trying to play sound [%s] which type is looped:", sound);
    }

    const sound_item: Optional<AbstractPlayableSound> = GlobalSound.sound_table.get(objectId);

    if (sound_item === null || playableSound.play_always) {
      if (sound_item !== null) {
        GlobalSound.sound_table.get(objectId).reset(objectId);
      }

      if (playableSound.play(objectId, faction, point)) {
        logger.info("Play sound, store in table:", objectId);
        GlobalSound.sound_table.set(objectId, playableSound);
      } else {
        logger.info("Play was not successful:", objectId);
      }
    } else {
      return GlobalSound.sound_table.get(objectId).snd_obj;
    }

    return GlobalSound.sound_table.get(objectId)?.snd_obj;
  }

  public static stop_sounds_by_id(objectId: number): void {
    logger.info("Stop sound play:", objectId);

    const playableSound: Optional<AbstractPlayableSound> = GlobalSound.sound_table.get(objectId);

    if (playableSound !== null) {
      playableSound.stop(objectId);
    }

    const loopedSounds: Optional<LuaTable<string, AbstractPlayableSound>> = GlobalSound.looped_sound.get(objectId);

    if (loopedSounds !== null) {
      for (const [k, it] of loopedSounds) {
        if (it && it.is_playing(objectId)) {
          it.stop(objectId);
        }
      }
    }
  }

  public static update(npc_id: number): void {
    const playableSound: Optional<AbstractPlayableSound> = GlobalSound.sound_table.get(npc_id);

    if (playableSound !== null) {
      if (!playableSound.is_playing(npc_id)) {
        playableSound.callback(npc_id);
        GlobalSound.sound_table.delete(npc_id);
      }
    }
  }

  public static play_sound_looped(npc_id: number, sound: string): void {
    logger.info();

    const snd_theme = sound_themes.get(sound);

    if (snd_theme === null) {
      abort("play_sound_looped. Wrong sound theme [%s], npc[%s]", tostring(sound), npc_id);
    }

    if (snd_theme.type !== "looped_sound") {
      abort("You trying to play sound [%s] which type is not looped", sound);
    }

    const looped_item = GlobalSound.looped_sound.get(npc_id);

    if (looped_item !== null && looped_item.get(sound) !== null && looped_item.get(sound).is_playing(npc_id)) {
      return;
    }

    if (snd_theme.play(npc_id)) {
      let new_item = looped_item;

      if (new_item === null) {
        new_item = new LuaTable();
        GlobalSound.looped_sound.set(npc_id, new_item);
      }

      new_item.set(sound, snd_theme);
    }
  }

  public static stop_sound_looped(npc_id: number, sound: string): void {
    const looped_item = GlobalSound.looped_sound.get(npc_id);
    const looped_sound_item = looped_item.get(sound);

    if (sound !== null) {
      if (type(looped_sound_item) !== "string") {
        if (looped_sound_item && looped_sound_item.is_playing(npc_id)) {
          looped_sound_item.stop();
          looped_item.delete(sound);
        }
      }
    } else {
      if (looped_item !== null) {
        for (const [k, v] of pairs(looped_item)) {
          if (v && type(v) !== "string" && v.is_playing(npc_id)) {
            v.stop();
          }
        }

        GlobalSound.looped_sound.delete(npc_id);
      }
    }
  }

  public static set_volume_sound_looped(npc_id: number, sound: string, level: number): void {
    const looped_item = GlobalSound.looped_sound.get(npc_id);

    if (looped_item !== null) {
      const sound_item = looped_item.get(sound);

      if (sound_item && sound_item.is_playing(npc_id)) {
        sound_item.set_volume(level);
      }
    }
  }

  public static actor_save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "sound_actor_save");

    for (const [k, v] of sound_themes) {
      v.save(packet);
    }

    let n: number = 0;

    for (const [k, v] of GlobalSound.sound_table) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.sound_table) {
      packet.w_u16(k as number);
      /* --[[
      if(type(v.section) !== "string") then
      thread:w_stringZ(v)
    } else {
    ]] */
      packet.w_stringZ(v.section);
      // --        }
    }

    n = 0;
    for (const [k, v] of GlobalSound.looped_sound) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.looped_sound) {
      packet.w_u16(k);
      n = 0;
      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        n = n + 1;
      }

      packet.w_u16(n);
      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        packet.w_stringZ(kk);
        /* --[[
      if(type(vv.section) !== "string") {
        thread.w_stringZ(vv)
      } else {
        thread.w_stringZ(vv.section)
      }
    ]] */
      }
    }

    setSaveMarker(packet, true, "sound_actor_save");
  }

  public static set_save_marker(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "sound_actor_save");

    for (const [k, v] of sound_themes) {
      v.save(packet);
    }

    let n = 0;

    for (const [k, v] of GlobalSound.sound_table) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.sound_table) {
      packet.w_u16(k as number);
      /* --[[
      if(type(v.section)!=="string") {
        thread:w_stringZ(v)
      } else {
      ]] */
      packet.w_stringZ(v.section);
      //  --        end
    }

    n = 0;

    for (const [k, v] of GlobalSound.looped_sound) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of GlobalSound.looped_sound) {
      packet.w_u16(k);
      n = 0;

      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        n = n + 1;
      }

      packet.w_u16(n);

      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        packet.w_stringZ(kk);
        /* --[[
        if(type(vv.section)!=="string") {
          packet:w_stringZ(vv)
        } else {
          packet:w_stringZ(vv.section)
        }
      ]]*/
      }
    }

    setSaveMarker(packet, true, "sound_actor_save");
  }

  public stop_all_sounds(): void {
    for (const [k, v] of GlobalSound.sound_table) {
      if (type(v) !== "string") {
        v.stop();
      }
    }

    for (const [k, v] of GlobalSound.looped_sound) {
      for (const [kk, vv] of GlobalSound.looped_sound.get(k)) {
        if (vv && vv.is_playing()) {
          vv.stop();
        }
      }
    }
  }

  public static reset(): void {
    GlobalSound.sound_table = new LuaTable();
  }

  public static actor_load(reader: XR_reader): void {
    setLoadMarker(reader, false, "sound_actor_save");

    for (const [k, v] of sound_themes) {
      v.load(reader);
    }

    GlobalSound.sound_table = new LuaTable();

    let n: number = reader.r_u16();

    for (const i of $range(1, n)) {
      const id = reader.r_u16();
      const theme = reader.r_stringZ();

      // --        sound_table[id] = thread:r_stringZ()
      GlobalSound.sound_table.set(id, sound_themes.get(theme));
    }

    GlobalSound.looped_sound = new LuaTable();
    n = reader.r_u16();

    for (const i of $range(1, n)) {
      const id = reader.r_u16();

      GlobalSound.looped_sound.set(id, new LuaTable());
      n = reader.r_u16();
      for (const j of $range(1, n)) {
        const sound = reader.r_stringZ();

        // --            looped_sound[id][sound] = thread:r_stringZ()
        GlobalSound.looped_sound.get(id).set(sound, sound_themes.get(sound));
      }
    }

    setLoadMarker(reader, true, "sound_actor_save");
  }

  public static save_npc(packet: XR_net_packet, npc_id: number): void {
    setSaveMarker(packet, false, "sound_npc_save");

    for (const [k, v] of sound_themes) {
      v.save_npc(packet, npc_id);
    }

    setSaveMarker(packet, true, "sound_npc_save");
  }

  public static load_npc(reader: XR_reader, npc_id: number): void {
    setLoadMarker(reader, false, "sound_npc_save");

    for (const [k, v] of sound_themes) {
      v.load_npc(reader, npc_id);
    }

    setLoadMarker(reader, true, "sound_npc_save");
  }
}
