import { TXR_net_processor, XR_game_object, XR_net_packet, XR_reader, XR_sound_object } from "xray16";

import { registry, SCRIPT_SOUND_LTX } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { AbstractPlayableSound } from "@/engine/core/objects/sounds/playable_sounds/AbstractPlayableSound";
import { ActorSound } from "@/engine/core/objects/sounds/playable_sounds/ActorSound";
import { LoopedSound } from "@/engine/core/objects/sounds/playable_sounds/LoopedSound";
import { NpcSound } from "@/engine/core/objects/sounds/playable_sounds/NpcSound";
import { ObjectSound } from "@/engine/core/objects/sounds/playable_sounds/ObjectSound";
import { EPlayableSound } from "@/engine/core/objects/sounds/types";
import { abort, assert } from "@/engine/core/utils/assertion";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity } from "@/engine/core/utils/object";
import { getTableSize, resetTable } from "@/engine/core/utils/table";
import { Optional, TCount, TName, TNumberId, TRate, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class GlobalSoundManager extends AbstractCoreManager {
  /**
   * todo: check.
   */
  public static initializeObjectSounds(object: XR_game_object): void {
    for (const [key, sound] of registry.sounds.themes) {
      if (sound.type === NpcSound.type) {
        if ((sound as NpcSound).availableCommunities.has(getCharacterCommunity(object))) {
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
    assert(SCRIPT_SOUND_LTX.section_exist("list"), "There is no section [list] in script_sound.ltx");
    resetTable(registry.sounds.themes);

    const linesCount: TCount = SCRIPT_SOUND_LTX.line_count("list");

    logger.info("Load sound themes:", linesCount);

    for (const it of $range(0, linesCount - 1)) {
      const [result, section, value] = SCRIPT_SOUND_LTX.r_line("list", it, "", "");

      const type: EPlayableSound = readIniString<EPlayableSound>(
        SCRIPT_SOUND_LTX,
        section,
        "type",
        true,
        ""
      ) as EPlayableSound;

      switch (type) {
        case ObjectSound.type:
          registry.sounds.themes.set(section, new ObjectSound(SCRIPT_SOUND_LTX, section));
          break;

        case NpcSound.type:
          registry.sounds.themes.set(section, new NpcSound(SCRIPT_SOUND_LTX, section));
          break;

        case ActorSound.type:
          registry.sounds.themes.set(section, new ActorSound(SCRIPT_SOUND_LTX, section));
          break;

        case LoopedSound.type:
          registry.sounds.themes.set(section, new LoopedSound(SCRIPT_SOUND_LTX, section));
          break;

        default:
          abort("Unexpected sound type provided for loading: %s", type);
      }
    }
  }

  /**
   * todo: Description.
   */
  public playSound(
    objectId: TNumberId,
    sound: Optional<TStringId>,
    faction: Optional<string>,
    point: Optional<TNumberId>
  ): Optional<XR_sound_object> {
    if (sound === null) {
      return null;
    }

    const playableTheme: Optional<AbstractPlayableSound> = registry.sounds.themes.get(sound);
    const soundItem: Optional<AbstractPlayableSound> = registry.sounds.generic.get(objectId);

    assert(playableTheme !== null, "'playSound': Wrong sound theme [%s], npc[%s].", tostring(sound), objectId);
    assert(playableTheme.type !== LoopedSound.type, "You trying to play sound [%s] which type is looped.", sound);

    if (soundItem === null || playableTheme.shouldPlayAlways) {
      if (soundItem !== null) {
        logger.info("Reset sound before forced play:", objectId, sound, faction, point);
        registry.sounds.generic.get(objectId).reset(objectId);
      }

      if (playableTheme.play(objectId, faction, point)) {
        logger.info("Start sound play:", objectId, sound, faction, point);
        registry.sounds.generic.set(objectId, playableTheme);
      }

      return registry.sounds.generic.get(objectId)?.soundObject;
    } else {
      return registry.sounds.generic.get(objectId).soundObject;
    }
  }

  /**
   * todo: Description.
   */
  public stopSoundByObjectId(objectId: TNumberId): void {
    const theme: Optional<AbstractPlayableSound> = registry.sounds.generic.get(objectId);

    if (theme !== null) {
      logger.info("Stop sound play:", objectId, theme.section);
      theme.stop(objectId);
    }

    const loopedSounds: Optional<LuaTable<string, AbstractPlayableSound>> = registry.sounds.looped.get(objectId);

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
    const loopedItem: Optional<LuaTable<TStringId, AbstractPlayableSound>> = registry.sounds.looped.get(objectId);

    if (loopedItem?.get(sound)?.isPlaying(objectId)) {
      return;
    }

    const soundTheme: Optional<AbstractPlayableSound> = registry.sounds.themes.get(sound);

    assert(soundTheme !== null, "'playLoopedSound': Wrong sound theme [%s], object [%s]", tostring(sound), objectId);
    assert(soundTheme.type === "looped", "Trying to play sound [%s] which type is not looped.", sound);

    if (soundTheme.play(objectId)) {
      let collection: Optional<LuaTable<TStringId, AbstractPlayableSound>> = loopedItem;

      if (collection === null) {
        collection = new LuaTable();
        registry.sounds.looped.set(objectId, collection);
      }

      collection.set(sound, soundTheme);
    }
  }

  /**
   * todo: Description.
   */
  public stopLoopedSound(objectId: TNumberId, sound: Optional<TStringId>): void {
    const loopedCollection: LuaTable<TStringId, AbstractPlayableSound> = registry.sounds.looped.get(objectId);

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

        registry.sounds.looped.delete(objectId);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setLoopedSoundVolume(objectId: TNumberId, sound: TStringId, volume: TRate): void {
    const loopedSound: Optional<LuaTable<TStringId, AbstractPlayableSound>> = registry.sounds.looped.get(objectId);

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

    for (const [, theme] of registry.sounds.generic) {
      if (type(theme) !== "string") {
        theme.stop();
      }
    }

    for (const [id] of registry.sounds.looped) {
      for (const [, theme] of registry.sounds.looped.get(id)) {
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
    const playableSound: Optional<AbstractPlayableSound> = registry.sounds.generic.get(objectId);

    if (playableSound !== null) {
      if (!playableSound.isPlaying(objectId)) {
        playableSound.onSoundPlayEnded(objectId);
        registry.sounds.generic.delete(objectId);
      }
    }
  }
  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, GlobalSoundManager.name + "Actor");

    for (const [, playableTheme] of registry.sounds.themes) {
      playableTheme.save(packet);
    }

    packet.w_u16(getTableSize(registry.sounds.generic));

    for (const [k, v] of registry.sounds.generic) {
      packet.w_u16(k);
      packet.w_stringZ(v.section);
    }

    packet.w_u16(getTableSize(registry.sounds.looped));

    for (const [id] of registry.sounds.looped) {
      packet.w_u16(id);
      packet.w_u16(getTableSize(registry.sounds.looped.get(id)));

      for (const [loopedThemeId] of registry.sounds.looped.get(id)) {
        packet.w_stringZ(loopedThemeId);
      }
    }

    setSaveMarker(packet, true, GlobalSoundManager.name + "Actor");
  }

  /**
   * todo: Description.
   */
  public override load(reader: TXR_net_processor): void {
    setLoadMarker(reader, false, GlobalSoundManager.name + "Actor");

    for (const [, theme] of registry.sounds.themes) {
      theme.load(reader);
    }

    const themesCount: TCount = reader.r_u16();

    registry.sounds.generic = new LuaTable();

    for (const it of $range(1, themesCount)) {
      const id: TNumberId = reader.r_u16();
      const theme: TStringId = reader.r_stringZ();

      registry.sounds.generic.set(id, registry.sounds.themes.get(theme));
    }

    const loopedSoundsCount: TCount = reader.r_u16();

    registry.sounds.looped = new LuaTable();

    for (const it of $range(1, loopedSoundsCount)) {
      const id = reader.r_u16();

      registry.sounds.looped.set(id, new LuaTable());

      const loopedThemesCount = reader.r_u16();

      for (const themeIndex of $range(1, loopedThemesCount)) {
        const sound: TStringId = reader.r_stringZ();

        registry.sounds.looped.get(id).set(sound, registry.sounds.themes.get(sound));
      }
    }

    setLoadMarker(reader, true, GlobalSoundManager.name + "Actor");
  }

  /**
   * todo: Description.
   */
  public saveObject(packet: XR_net_packet, object: XR_game_object): void {
    setSaveMarker(packet, false, GlobalSoundManager.name + "Object");

    for (const [, theme] of registry.sounds.themes) {
      theme.saveObject(packet, object);
    }

    setSaveMarker(packet, true, GlobalSoundManager.name + "Object");
  }

  /**
   * todo: Description.
   */
  public loadObject(reader: XR_reader, object: XR_game_object): void {
    setLoadMarker(reader, false, GlobalSoundManager.name + "Object");

    for (const [, theme] of registry.sounds.themes) {
      theme.loadObject(reader, object);
    }

    setLoadMarker(reader, true, GlobalSoundManager.name + "Object");
  }
}
