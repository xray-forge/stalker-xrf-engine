import { XR_net_packet, XR_reader, XR_sound_object } from "xray16";

import { Optional, TName, TNumberId, TStringId } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { LoopedSound } from "@/mod/scripts/core/sound/playable_sounds/LoopedSound";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("GlobalSoundManager");

/**
 * todo;
 */
export class GlobalSoundManager extends AbstractCoreManager {
  /**
   * todo;
   */
  public static setSoundPlay(
    objectId: TNumberId,
    sound: Optional<TStringId>,
    faction: Optional<string>,
    point: Optional<TNumberId>
  ): Optional<XR_sound_object> {
    logger.info("Set sound play:", objectId, sound, faction, point);

    if (sound === null) {
      return null;
    }

    const playableSound: Optional<AbstractPlayableSound> = registry.sounds.themes.get(sound);

    if (playableSound === null) {
      abort("set_sound_play. Wrong sound theme [%s], npc[%s].", tostring(sound), objectId);
    } else if (playableSound.type === LoopedSound.type) {
      abort("You trying to play sound [%s] which type is looped:", sound);
    }

    const soundItem: Optional<AbstractPlayableSound> = registry.sounds.generic.get(objectId);

    if (soundItem === null || playableSound.play_always) {
      if (soundItem !== null) {
        registry.sounds.generic.get(objectId).reset(objectId);
      }

      if (playableSound.play(objectId, faction, point)) {
        logger.info("Play sound, store in table:", objectId);
        registry.sounds.generic.set(objectId, playableSound);
      } else {
        logger.info("Play was not successful:", objectId, sound, faction, point);
      }
    } else {
      return registry.sounds.generic.get(objectId).snd_obj;
    }

    return registry.sounds.generic.get(objectId)?.snd_obj;
  }

  /**
   * todo;
   */
  public static stopSoundsById(objectId: TNumberId): void {
    logger.info("Stop sound play:", objectId);

    const playableSound: Optional<AbstractPlayableSound> = registry.sounds.generic.get(objectId);

    if (playableSound !== null) {
      playableSound.stop(objectId);
    }

    const loopedSounds: Optional<LuaTable<string, AbstractPlayableSound>> = registry.sounds.looped.get(objectId);

    if (loopedSounds !== null) {
      for (const [k, it] of loopedSounds) {
        if (it && it.is_playing(objectId)) {
          it.stop(objectId);
        }
      }
    }
  }

  /**
   * todo;
   */
  public static updateForId(objectId: TNumberId): void {
    const playableSound: Optional<AbstractPlayableSound> = registry.sounds.generic.get(objectId);

    if (playableSound !== null) {
      if (!playableSound.is_playing(objectId)) {
        playableSound.callback(objectId);
        registry.sounds.generic.delete(objectId);
      }
    }
  }

  /**
   * todo;
   */
  public static playLoopedSound(objectId: TNumberId, sound: TName): void {
    logger.info();

    const snd_theme: Optional<AbstractPlayableSound> = registry.sounds.themes.get(sound);

    if (snd_theme === null) {
      abort("play_sound_looped. Wrong sound theme [%s], npc[%s]", tostring(sound), objectId);
    } else if (snd_theme.type !== "looped") {
      abort("You trying to play sound [%s] which type is not looped", sound);
    }

    const looped_item = registry.sounds.looped.get(objectId);

    if (looped_item !== null && looped_item.get(sound) !== null && looped_item.get(sound).is_playing(objectId)) {
      return;
    }

    if (snd_theme.play(objectId)) {
      let new_item = looped_item;

      if (new_item === null) {
        new_item = new LuaTable();
        registry.sounds.looped.set(objectId, new_item);
      }

      new_item.set(sound, snd_theme);
    }
  }

  public static stop_sound_looped(objectId: TNumberId, sound: Optional<TName>): void {
    const looped_item = registry.sounds.looped.get(objectId);
    const looped_sound_item = looped_item.get(sound as string);

    if (sound !== null) {
      if (type(looped_sound_item) !== "string") {
        if (looped_sound_item && looped_sound_item.is_playing(objectId)) {
          looped_sound_item.stop();
          looped_item.delete(sound);
        }
      }
    } else {
      if (looped_item !== null) {
        for (const [k, v] of pairs(looped_item)) {
          if (v && type(v) !== "string" && v.is_playing(objectId)) {
            v.stop();
          }
        }

        registry.sounds.looped.delete(objectId);
      }
    }
  }

  public static set_volume_sound_looped(objectId: TNumberId, sound: TName, level: number): void {
    const looped_item = registry.sounds.looped.get(objectId);

    if (looped_item !== null) {
      const sound_item = looped_item.get(sound);

      if (sound_item && sound_item.is_playing(objectId)) {
        sound_item.set_volume(level);
      }
    }
  }

  public static actor_save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "sound_actor_save");

    for (const [k, v] of registry.sounds.themes) {
      v.save(packet);
    }

    let n: number = 0;

    for (const [k, v] of registry.sounds.generic) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of registry.sounds.generic) {
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
    for (const [k, v] of registry.sounds.looped) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of registry.sounds.looped) {
      packet.w_u16(k);
      n = 0;
      for (const [kk, vv] of registry.sounds.looped.get(k)) {
        n = n + 1;
      }

      packet.w_u16(n);
      for (const [kk, vv] of registry.sounds.looped.get(k)) {
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

    for (const [k, v] of registry.sounds.themes) {
      v.save(packet);
    }

    let n = 0;

    for (const [k, v] of registry.sounds.generic) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of registry.sounds.generic) {
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

    for (const [k, v] of registry.sounds.looped) {
      n = n + 1;
    }

    packet.w_u16(n);

    for (const [k, v] of registry.sounds.looped) {
      packet.w_u16(k);
      n = 0;

      for (const [kk, vv] of registry.sounds.looped.get(k)) {
        n = n + 1;
      }

      packet.w_u16(n);

      for (const [kk, vv] of registry.sounds.looped.get(k)) {
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
    for (const [k, v] of registry.sounds.generic) {
      if (type(v) !== "string") {
        v.stop();
      }
    }

    for (const [k, v] of registry.sounds.looped) {
      for (const [kk, vv] of registry.sounds.looped.get(k)) {
        if (vv && vv.is_playing()) {
          vv.stop();
        }
      }
    }
  }

  public static reset(): void {
    registry.sounds.generic = new LuaTable();
  }

  public static actor_load(reader: XR_reader): void {
    setLoadMarker(reader, false, "sound_actor_save");

    for (const [k, v] of registry.sounds.themes) {
      v.load(reader);
    }

    registry.sounds.generic = new LuaTable();

    let n: number = reader.r_u16();

    for (const i of $range(1, n)) {
      const id = reader.r_u16();
      const theme = reader.r_stringZ();

      // --        sound_table[id] = thread:r_stringZ()
      registry.sounds.generic.set(id, registry.sounds.themes.get(theme));
    }

    registry.sounds.looped = new LuaTable();
    n = reader.r_u16();

    for (const i of $range(1, n)) {
      const id = reader.r_u16();

      registry.sounds.looped.set(id, new LuaTable());
      n = reader.r_u16();
      for (const j of $range(1, n)) {
        const sound = reader.r_stringZ();

        // --            looped_sound[id][sound] = thread:r_stringZ()
        registry.sounds.looped.get(id).set(sound, registry.sounds.themes.get(sound));
      }
    }

    setLoadMarker(reader, true, "sound_actor_save");
  }

  public static save_npc(packet: XR_net_packet, npc_id: number): void {
    setSaveMarker(packet, false, "sound_npc_save");

    for (const [k, v] of registry.sounds.themes) {
      v.save_npc(packet, npc_id);
    }

    setSaveMarker(packet, true, "sound_npc_save");
  }

  public static load_npc(reader: XR_reader, npc_id: number): void {
    setLoadMarker(reader, false, "sound_npc_save");

    for (const [k, v] of registry.sounds.themes) {
      v.load_npc(reader, npc_id);
    }

    setLoadMarker(reader, true, "sound_npc_save");
  }
}
