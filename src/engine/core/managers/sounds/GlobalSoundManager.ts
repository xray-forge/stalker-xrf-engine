import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { AbstractPlayableSound } from "@/engine/core/objects/sounds/playable_sounds/AbstractPlayableSound";
import { LoopedSound } from "@/engine/core/objects/sounds/playable_sounds/LoopedSound";
import { NpcSound } from "@/engine/core/objects/sounds/playable_sounds/NpcSound";
import { assert } from "@/engine/core/utils/assertion";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  ClientObject,
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
 * todo;
 */
export class GlobalSoundManager extends AbstractManager {
  /**
   * todo: check.
   */
  public static initializeObjectSounds(object: ClientObject): void {
    for (const [, sound] of soundsConfig.themes) {
      if (sound.type === NpcSound.type) {
        if ((sound as NpcSound).availableCommunities.has(getObjectCommunity(object))) {
          (sound as NpcSound).initializeObject(object);
        }
      }
    }
  }

  /**
   * Load all possible sounds from file system and register in RAM database.
   * Sound descriptors are stored as singleton of each variant.
   */
  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorNetworkDestroy);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate);
  }

  /**
   * todo: Description.
   */
  public playSound(
    objectId: TNumberId,
    sound: Optional<TStringId>,
    faction: Optional<string> = null,
    point: Optional<TNumberId> = null
  ): Optional<SoundObject> {
    if (sound === null) {
      return null;
    }

    const playableTheme: Optional<AbstractPlayableSound> = soundsConfig.themes.get(sound);
    const soundItem: Optional<AbstractPlayableSound> = soundsConfig.generic.get(objectId);

    assert(playableTheme, "'playSound': Wrong sound theme [%s], object [%s].", tostring(sound), objectId);
    assert(playableTheme.type !== LoopedSound.type, "You trying to play sound [%s] which type is looped.", sound);

    if (soundItem === null || playableTheme.shouldPlayAlways) {
      if (soundItem !== null) {
        logger.info("Reset sound before forced play:", objectId, sound, faction, point);
        soundsConfig.generic.get(objectId).reset(objectId);
      }

      if (playableTheme.play(objectId, faction, point)) {
        logger.info("Start sound play:", objectId, sound, faction, point);
        soundsConfig.generic.set(objectId, playableTheme);
      }

      return soundsConfig.generic.get(objectId)?.soundObject;
    } else {
      return soundsConfig.generic.get(objectId).soundObject;
    }
  }

  /**
   * todo: Description.
   */
  public stopSoundByObjectId(objectId: TNumberId): void {
    const theme: Optional<AbstractPlayableSound> = soundsConfig.generic.get(objectId);

    if (theme !== null) {
      logger.info("Stop sound play:", objectId, theme.section);
      theme.stop(objectId);
    }

    const loopedSounds: Optional<LuaTable<string, AbstractPlayableSound>> = soundsConfig.looped.get(objectId);

    if (loopedSounds !== null) {
      for (const [k, theme] of loopedSounds) {
        if (theme?.isPlaying(objectId)) {
          logger.info("Stop looped sound play:", objectId, theme.section);
          theme.stop(objectId);
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

    assert(soundTheme !== null, "'playLoopedSound': Wrong sound theme [%s], object [%s]", tostring(sound), objectId);
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

    if (sound !== null) {
      const loopedTheme: Optional<AbstractPlayableSound> = loopedCollection.get(sound);

      if (loopedTheme?.isPlaying(objectId)) {
        loopedTheme.stop();
        loopedCollection.delete(sound);
      }
    } else {
      if (loopedCollection !== null) {
        for (const [, theme] of loopedCollection) {
          if (theme.isPlaying(objectId)) {
            theme.stop();
          }
        }

        soundsConfig.looped.delete(objectId);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setLoopedSoundVolume(objectId: TNumberId, sound: TStringId, volume: TRate): void {
    const loopedSound: Optional<LuaTable<TStringId, AbstractPlayableSound>> = soundsConfig.looped.get(objectId);

    if (loopedSound !== null) {
      const soundItem: Optional<AbstractPlayableSound> = loopedSound.get(sound);

      if (soundItem?.isPlaying(objectId)) {
        soundItem.setVolume(volume);
      }
    }
  }

  /**
   * todo: Description.
   */
  public stopAllSounds(): void {
    logger.info("Stop all sounds");

    for (const [, theme] of soundsConfig.generic) {
      if (type(theme) !== "string") {
        theme.stop();
      }
    }

    for (const [id] of soundsConfig.looped) {
      for (const [, theme] of soundsConfig.looped.get(id)) {
        if (theme.isPlaying()) {
          theme.stop();
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public override update(objectId: TNumberId): void {
    const playableSound: Optional<AbstractPlayableSound> = soundsConfig.generic.get(objectId);

    if (playableSound !== null) {
      if (!playableSound.isPlaying(objectId)) {
        playableSound.onSoundPlayEnded(objectId);
        soundsConfig.generic.delete(objectId);
      }
    }
  }

  /**
   * Handle actor destroy and mute all sounds.
   */
  public onActorNetworkDestroy(): void {
    this.stopSoundByObjectId(registry.actor.id());
  }

  /**
   * Handle actor generic update.
   */
  public onActorUpdate(): void {
    this.update(registry.actor.id());
  }

  /**
   * todo: Description.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, GlobalSoundManager.name + "Actor");

    for (const [, playableTheme] of soundsConfig.themes) {
      playableTheme.save(packet);
    }

    packet.w_u16(table.size(soundsConfig.generic));

    for (const [k, v] of soundsConfig.generic) {
      packet.w_u16(k);
      packet.w_stringZ(v.section);
    }

    packet.w_u16(table.size(soundsConfig.looped));

    for (const [id] of soundsConfig.looped) {
      packet.w_u16(id);
      packet.w_u16(table.size(soundsConfig.looped.get(id)));

      for (const [loopedThemeId] of soundsConfig.looped.get(id)) {
        packet.w_stringZ(loopedThemeId);
      }
    }

    closeSaveMarker(packet, GlobalSoundManager.name + "Actor");
  }

  /**
   * todo: Description.
   */
  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, GlobalSoundManager.name + "Actor");

    for (const [, theme] of soundsConfig.themes) {
      theme.load(reader);
    }

    const themesCount: TCount = reader.r_u16();

    soundsConfig.generic = new LuaTable();

    for (const it of $range(1, themesCount)) {
      const id: TNumberId = reader.r_u16();
      const theme: TStringId = reader.r_stringZ();

      soundsConfig.generic.set(id, soundsConfig.themes.get(theme));
    }

    const loopedSoundsCount: TCount = reader.r_u16();

    soundsConfig.looped = new LuaTable();

    for (const it of $range(1, loopedSoundsCount)) {
      const id = reader.r_u16();

      soundsConfig.looped.set(id, new LuaTable());

      const loopedThemesCount = reader.r_u16();

      for (const themeIndex of $range(1, loopedThemesCount)) {
        const sound: TStringId = reader.r_stringZ();

        soundsConfig.looped.get(id).set(sound, soundsConfig.themes.get(sound));
      }
    }

    closeLoadMarker(reader, GlobalSoundManager.name + "Actor");
  }

  /**
   * todo: Description.
   */
  public saveObject(packet: NetPacket, object: ClientObject): void {
    openSaveMarker(packet, GlobalSoundManager.name + "Object");

    for (const [, theme] of soundsConfig.themes) {
      theme.saveObject(packet, object);
    }

    closeSaveMarker(packet, GlobalSoundManager.name + "Object");
  }

  /**
   * todo: Description.
   */
  public loadObject(reader: NetProcessor, object: ClientObject): void {
    openLoadMarker(reader, GlobalSoundManager.name + "Object");

    for (const [, theme] of soundsConfig.themes) {
      theme.loadObject(reader, object);
    }

    closeLoadMarker(reader, GlobalSoundManager.name + "Object");
  }
}
