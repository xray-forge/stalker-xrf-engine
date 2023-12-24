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
   * todo: Description.
   */
  public stopSoundByObjectId(objectId: TNumberId): void {
    const theme: Optional<AbstractPlayableSound> = soundsConfig.playing.get(
      objectId
    ) as Optional<AbstractPlayableSound>;

    if (theme) {
      logger.info("Stop sound play:", objectId, theme.section);
      theme.stop(objectId);
    }

    const loopedSounds: Optional<LuaTable<TName, AbstractPlayableSound>> = soundsConfig.looped.get(
      objectId
    ) as Optional<LuaTable<TName, AbstractPlayableSound>>;

    if (loopedSounds) {
      for (const [, sound] of loopedSounds) {
        if (sound.isPlaying(objectId)) {
          logger.info("Stop looped sound play:", objectId, sound.section);
          sound.stop(objectId);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public playLoopedSound(objectId: TNumberId, sound: TName): void {
    const loopedItem: Optional<LuaTable<TStringId, AbstractPlayableSound>> = soundsConfig.looped.get(objectId);

    if (loopedItem?.get(sound)?.isPlaying(objectId)) {
      return;
    }

    const soundTheme: Optional<AbstractPlayableSound> = soundsConfig.themes.get(sound);

    assert(soundTheme, "'playLoopedSound': Wrong sound theme [%s], object [%s]", tostring(sound), objectId);
    assert(soundTheme.type === "looped", "Trying to play sound [%s] which type is not looped.", sound);

    if (soundTheme.play(objectId)) {
      let collection: Optional<LuaTable<TStringId, AbstractPlayableSound>> = loopedItem;

      if (collection === null) {
        collection = new LuaTable();
        soundsConfig.looped.set(objectId, collection);
      }

      collection.set(sound, soundTheme);
    }
  }

  /**
   * todo: Description.
   */
  public stopLoopedSound(objectId: TNumberId, sound: Optional<TStringId>): void {
    const loopedCollection: LuaTable<TStringId, AbstractPlayableSound> = soundsConfig.looped.get(objectId);

    if (sound) {
      const loopedTheme: Optional<AbstractPlayableSound> = loopedCollection.get(sound);

      if (loopedTheme?.isPlaying(objectId)) {
        loopedTheme.stop();
        loopedCollection.delete(sound);
      }
    } else {
      for (const [, theme] of loopedCollection) {
        if (theme.isPlaying(objectId)) {
          theme.stop();
        }

        soundsConfig.looped.delete(objectId);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setLoopedSoundVolume(objectId: TNumberId, sound: TStringId, volume: TRate): void {
    const loopedSound: Optional<LuaTable<TStringId, AbstractPlayableSound>> = soundsConfig.looped.get(
      objectId
    ) as Optional<LuaTable<TStringId, AbstractPlayableSound>>;

    if (loopedSound) {
      const soundItem: Optional<AbstractPlayableSound> = loopedSound.get(sound);

      if (soundItem?.isPlaying(objectId)) {
        soundItem.setVolume(volume);
      }
    }
  }

  /**
   * Handle actor destroy and mute all sounds.
   */
  public onActorNetworkDestroy(): void {
    this.stopSoundByObjectId(ACTOR_ID);
  }

  /**
   * Handle actor generic update.
   */
  public onActorUpdate(): void {
    this.update(ACTOR_ID);
  }
}
