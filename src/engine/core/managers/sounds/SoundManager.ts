import { closeLoadMarker, closeSaveMarker, getManager, openLoadMarker, openSaveMarker } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects/AbstractPlayableSound";
import { LoopedSound } from "@/engine/core/managers/sounds/objects/LoopedSound";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  GameObject,
  NetPacket,
  NetProcessor,
  Optional,
  SoundObject,
  TCount,
  TName,
  TNumberId,
  TRate,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager of game effects/sounds/voices triggered from script engine.
 *
 * todo: Unify looped and non-looped play-stop methods?
 */
export class SoundManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate);
  }

  public override update(objectId: TNumberId): void {
    const sound: Optional<AbstractPlayableSound> = soundsConfig.playing.get(objectId);

    if (sound && !sound.isPlaying(objectId)) {
      sound.onSoundPlayEnded(objectId);
      soundsConfig.playing.delete(objectId);
    }
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, SoundManager.name + "Actor");

    for (const [, sound] of soundsConfig.themes) {
      sound.save(packet);
    }

    packet.w_u16(table.size(soundsConfig.playing));

    for (const [id, sound] of soundsConfig.playing) {
      packet.w_u16(id);
      packet.w_stringZ(sound.section);
    }

    packet.w_u16(table.size(soundsConfig.looped));

    for (const [id, loopedThemes] of soundsConfig.looped) {
      packet.w_u16(id);
      packet.w_u16(table.size(loopedThemes));

      for (const [themeId] of loopedThemes) {
        packet.w_stringZ(themeId);
      }
    }

    closeSaveMarker(packet, SoundManager.name + "Actor");
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, SoundManager.name + "Actor");

    for (const [, theme] of soundsConfig.themes) {
      theme.load(reader);
    }

    const themesCount: TCount = reader.r_u16();

    soundsConfig.playing = new LuaTable();

    for (const _ of $range(1, themesCount)) {
      const id: TNumberId = reader.r_u16();
      const theme: TStringId = reader.r_stringZ();

      soundsConfig.playing.set(id, soundsConfig.themes.get(theme));
    }

    const loopedSoundsCount: TCount = reader.r_u16();

    soundsConfig.looped = new LuaTable();

    for (const _ of $range(1, loopedSoundsCount)) {
      const id = reader.r_u16();

      soundsConfig.looped.set(id, new LuaTable());

      const loopedThemesCount = reader.r_u16();

      for (const _ of $range(1, loopedThemesCount)) {
        const sound: TStringId = reader.r_stringZ();

        soundsConfig.looped.get(id).set(sound, soundsConfig.themes.get(sound));
      }
    }

    closeLoadMarker(reader, SoundManager.name + "Actor");
  }

  /**
   * Perform sound state saving for provided object.
   *
   * @param object - target game object to save
   * @param packet - net packet to save data into
   */
  public saveObject(object: GameObject, packet: NetPacket): void {
    openSaveMarker(packet, SoundManager.name + "Object");

    for (const [, sound] of soundsConfig.themes) {
      sound.saveObject(packet, object);
    }

    closeSaveMarker(packet, SoundManager.name + "Object");
  }

  /**
   * Perform sound state saving for provided object.
   *
   * @param object - target game object to save
   * @param reader - net reader to read data from
   */
  public loadObject(object: GameObject, reader: NetProcessor): void {
    openLoadMarker(reader, SoundManager.name + "Object");

    for (const [, sound] of soundsConfig.themes) {
      sound.loadObject(reader, object);
    }

    closeLoadMarker(reader, SoundManager.name + "Object");
  }

  /**
   * Play sound for provided object.
   * Based on parsed themes library defined with `script_sounds.ltx`.
   *
   * todo: Get rid of nullable name type.
   *
   * @param objectId - target object ID to play sound for
   * @param name - name of the sound
   * @param faction - faction of the object to play sound
   * @param point - ? todo;
   * @returns playing sound object
   */
  public play(
    objectId: TNumberId,
    name: Optional<TStringId>,
    faction: Optional<TName> = null,
    point: Optional<TNumberId> = null
  ): Optional<SoundObject> {
    if (!name) {
      return null;
    }

    const theme: Optional<AbstractPlayableSound> = soundsConfig.themes.get(name);
    const sound: Optional<AbstractPlayableSound> = soundsConfig.playing.get(
      objectId
    ) as Optional<AbstractPlayableSound>;

    assert(theme, "Not existing sound theme '%s' provided for playing with object '%s'.", name, objectId);
    assert(theme.type !== LoopedSound.type, "Trying to start sound '%s' with incorrect play method.", name);

    if (!sound || theme.shouldPlayAlways) {
      if (sound) {
        logger.info("Reset sound before forced play:", objectId, name, faction, point);
        sound.reset(objectId);
      }

      if (theme.play(objectId, faction, point)) {
        logger.info("Start sound play:", objectId, name, faction, point);

        soundsConfig.playing.set(objectId, theme);

        return theme.soundObject;
      }

      return theme?.soundObject;
    } else {
      return sound.soundObject;
    }
  }

  /**
   * Stops all sounds for provided object ID.
   *
   * @param objectId - target object ID to stop all sounds for
   */
  public stop(objectId: TNumberId): void {
    const sound: Optional<AbstractPlayableSound> = soundsConfig.playing.get(
      objectId
    ) as Optional<AbstractPlayableSound>;

    if (sound) {
      logger.info("Stop sound play:", objectId, sound.section);
      sound.stop(objectId);
    }

    const looped: Optional<LuaTable<TName, AbstractPlayableSound>> = soundsConfig.looped.get(objectId) as Optional<
      LuaTable<TName, AbstractPlayableSound>
    >;

    if (looped) {
      for (const [, sound] of looped) {
        if (sound.isPlaying(objectId)) {
          logger.info("Stop looped sound play:", objectId, sound.section);
          sound.stop(objectId);
        }
      }
    }
  }

  /**
   * Start looped sound playing for provided object ID.
   *
   * @param objectId - target object ID to play sound for
   * @param name - name of the looped sound to start
   */
  public playLooped(objectId: TNumberId, name: TName): void {
    const looped: Optional<LuaTable<TStringId, AbstractPlayableSound>> = soundsConfig.looped.get(objectId);

    if (looped && looped.get(name)?.isPlaying(objectId)) {
      return;
    }

    const theme: Optional<AbstractPlayableSound> = soundsConfig.themes.get(name);

    assert(theme, "Not existing sound theme '%s' provided for loop playing with object '%s'.", name, objectId);
    assert(theme.type === LoopedSound.type, "Trying to start sound '%s' with incorrect play looped method.", name);

    if (theme.play(objectId)) {
      let collection: Optional<LuaTable<TStringId, AbstractPlayableSound>> = looped;

      if (!collection) {
        collection = new LuaTable();
        soundsConfig.looped.set(objectId, collection);
      }

      collection.set(name, theme);
    }
  }

  /**
   * Stop looped sound by object ID and name.
   *
   * @param objectId - target object ID to stop sound for
   * @param name - name of the looped sound to stop
   */
  public stopLooped(objectId: TNumberId, name: TName): void {
    const collection: LuaTable<TStringId, AbstractPlayableSound> = soundsConfig.looped.get(objectId);
    const sound: Optional<AbstractPlayableSound> = collection?.get(name);

    if (!sound) {
      return;
    }

    if (sound.isPlaying(objectId)) {
      sound.stop();
    }

    collection.delete(name);

    // todo: Remove collection if it is empty?
  }

  /**
   * Stop all looped sounds for object.
   *
   * @param objectId - target object ID to stop sounds for
   */
  public stopAllLooped(objectId: TNumberId): void {
    const collection: LuaTable<TStringId, AbstractPlayableSound> = soundsConfig.looped.get(objectId);

    for (const [, sound] of collection) {
      if (sound.isPlaying(objectId)) {
        sound.stop();
      }
    }

    soundsConfig.looped.delete(objectId);
  }

  /**
   * @param objectId - target object ID to set sound volume for
   * @param name - name of the sound to set volume for
   * @param volume - value of volume to set
   */
  public setLoopedSoundVolume(objectId: TNumberId, name: TName, volume: TRate): void {
    const sound: Optional<AbstractPlayableSound> = soundsConfig.looped.get(objectId)?.get(name);

    if (sound && sound.isPlaying(objectId)) {
      sound.setVolume(volume);
    }
  }

  /**
   * Handle actor destroy and mute all sounds.
   */
  public onActorNetworkDestroy(): void {
    this.stop(ACTOR_ID);
  }

  /**
   * Handle actor generic update.
   */
  public onActorUpdate(): void {
    this.update(ACTOR_ID);
  }
}
