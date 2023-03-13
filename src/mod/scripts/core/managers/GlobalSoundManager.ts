import { XR_net_packet, XR_reader, XR_sound_object } from "xray16";

import { Optional, TName, TNumberId, TRate, TStringId } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { LoopedSound } from "@/mod/scripts/core/sound/playable_sounds/LoopedSound";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class GlobalSoundManager extends AbstractCoreManager {
  /**
   * todo;
   */
  public setSoundPlaying(
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
      }
    } else {
      return registry.sounds.generic.get(objectId).snd_obj;
    }

    return registry.sounds.generic.get(objectId)?.snd_obj;
  }

  /**
   * todo;
   */
  public stopSoundsByObjectId(objectId: TNumberId): void {
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
  public updateForObjectId(objectId: TNumberId): void {
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
  public playLoopedSound(objectId: TNumberId, sound: TName): void {
    const soundTheme: Optional<AbstractPlayableSound> = registry.sounds.themes.get(sound);

    if (soundTheme === null) {
      abort("play_sound_looped. Wrong sound theme [%s], npc[%s]", tostring(sound), objectId);
    } else if (soundTheme.type !== "looped") {
      abort("You trying to play sound [%s] which type is not looped", sound);
    }

    const loopedItem = registry.sounds.looped.get(objectId);

    if (loopedItem !== null && loopedItem.get(sound) !== null && loopedItem.get(sound).is_playing(objectId)) {
      return;
    }

    if (soundTheme.play(objectId)) {
      let newItem = loopedItem;

      if (newItem === null) {
        newItem = new LuaTable();
        registry.sounds.looped.set(objectId, newItem);
      }

      newItem.set(sound, soundTheme);
    }
  }

  /**
   * todo;
   */
  public stopLoopedSound(objectId: TNumberId, sound: Optional<TName>): void {
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

  /**
   * todo;
   */
  public setLoopedSoundVolume(objectId: TNumberId, sound: TName, volume: TRate): void {
    const loopedSound = registry.sounds.looped.get(objectId);

    if (loopedSound !== null) {
      const soundItem = loopedSound.get(sound);

      if (soundItem && soundItem.is_playing(objectId)) {
        soundItem.set_volume(volume);
      }
    }
  }

  /**
   * todo;
   */
  public stopAllSounds(): void {
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

  /**
   * todo;
   */
  public reset(): void {
    registry.sounds.generic = new LuaTable();
  }

  /**
   * todo;
   */
  public saveActor(packet: XR_net_packet): void {
    setSaveMarker(packet, false, GlobalSoundManager.name + "Actor");

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

    setSaveMarker(packet, true, GlobalSoundManager.name + "Actor");
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, GlobalSoundManager.name);

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

    setSaveMarker(packet, true, GlobalSoundManager.name);
  }

  /**
   * todo;
   */
  public loadActor(reader: XR_reader): void {
    setLoadMarker(reader, false, GlobalSoundManager.name + "Actor");

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

    setLoadMarker(reader, true, GlobalSoundManager.name + "Actor");
  }

  /**
   * todo;
   */
  public saveForObjectId(packet: XR_net_packet, objectId: TNumberId): void {
    setSaveMarker(packet, false, GlobalSoundManager.name + "Object");

    for (const [k, v] of registry.sounds.themes) {
      v.save_npc(packet, objectId);
    }

    setSaveMarker(packet, true, GlobalSoundManager.name + "Object");
  }

  /**
   * todo;
   */
  public loadForObjectId(reader: XR_reader, objectId: TNumberId): void {
    setLoadMarker(reader, false, GlobalSoundManager.name + "Object");

    for (const [name, theme] of registry.sounds.themes) {
      theme.load_npc(reader, objectId);
    }

    setLoadMarker(reader, true, GlobalSoundManager.name + "Object");
  }
}
