import { FS, get_hud, getFS, sound_object, time_global } from "xray16";
import { GameObject, IniFile, NetPacket, NetProcessor, SoundObject } from "xray16/alias";
import {
  createEmptyVector,
  LuaArray,
  NIL,
  Nillable,
  StringNillable,
  TCount,
  TDuration,
  TIndex,
  TNumberId,
  TPath,
  TSection,
  TStringId,
  TTimestamp,
} from "xray16/lib";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, ISoundNotification } from "@/engine/core/managers/notifications/notifications_types";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects/AbstractPlayableSound";
import { EPlayableSound, ESoundPlaylistType } from "@/engine/core/managers/sounds/sounds_types";
import { assert } from "@/engine/core/utils/assertion";
import { parseStringsList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { roots } from "@/engine/lib/constants/roots";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Playable sound bound to a game object and emitted from its 3D world position.
 */
export class ObjectSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound["3D"];

  public readonly type: EPlayableSound = ObjectSound.type;
  public readonly soundPaths: LuaArray<TPath> = new LuaTable();
  public pdaSoundObject: Nillable<SoundObject> = null;

  public shuffle: ESoundPlaylistType;
  public faction: string;
  public point: string;
  public message: string;

  public canPlaySound: boolean = true;
  public playingStartedAt: Nillable<TTimestamp> = null;
  public playedSoundIndex: Nillable<TIndex> = null;

  public idleTime: Nillable<TDuration> = null;
  public minIdle: TDuration;
  public maxIdle: TDuration;
  public rnd: number;

  public constructor(ini: IniFile, section: TSection) {
    super(ini, section);

    const interval: LuaArray<string> = parseStringsList(readIniString(ini, section, "idle", false, null, "3,5,100"));

    this.shuffle = readIniString(ini, section, "shuffle", false, null, ESoundPlaylistType.RANDOM) as ESoundPlaylistType;
    this.minIdle = tonumber(interval.get(1))!;
    this.maxIdle = tonumber(interval.get(2))!;
    this.rnd = tonumber(interval.get(3))!;
    this.faction = readIniString(ini, section, "faction", false, null, "");
    this.point = readIniString(ini, section, "point", false, null, "");
    this.message = readIniString(ini, section, "message", false, null, "");

    const fs: FS = getFS();

    if (fs.exist(roots.gameSounds, this.path + ".ogg") !== null) {
      this.soundPaths.set(1, this.path);
    } else {
      let index: TIndex = 1;

      while (fs.exist(roots.gameSounds, this.path + index + ".ogg")) {
        this.soundPaths.set(index, this.path + index);
        index += 1;
      }
    }

    assert(this.soundPaths.length() > 0, "There are no sound collection with path: '%s'.", this.path);
  }

  /**
   * Start playing the next sound from the object position, optionally adding a PDA variant for distant actors.
   *
   * @param objectId - Id of the game object emitting the sound.
   * @param faction - Faction associated with the sound notification.
   * @param point - Point label associated with the sound notification.
   * @param message - Message associated with the sound notification.
   * @returns Whether the sound playback was started.
   */
  public play(objectId: TNumberId, faction: string, point: string, message: string): boolean {
    const object: Nillable<GameObject> = registry.objects.get(objectId)?.object;

    if (!object) {
      return false; // No object existing.
    } else if (!this.canPlaySound) {
      return false; // Cannot play.
    } else if (this.playingStartedAt && time_global() - this.playingStartedAt < (this.idleTime as TDuration)) {
      return false; // Still playing.
    }

    this.playingStartedAt = null;
    this.playedSoundIndex = this.selectNextSound();

    // Nothing to play.
    if (this.playedSoundIndex === -1) {
      return false;
    }

    logger.info("Play object sound: %s %s %s %s", object.name(), faction, point, message);

    const fs: FS = getFS();
    const soundPath: Nillable<TPath> = this.soundPaths.get(this.playedSoundIndex!);

    // If actor is far from NPC, play pda sounds.
    if (
      soundPath &&
      fs.exist(roots.gameSounds, soundPath + "_pda.ogg") !== null &&
      object.position().distance_to_sqr(registry.actor.position()) >= 5
    ) {
      this.pdaSoundObject = new sound_object(soundPath + "_pda");
      this.pdaSoundObject.play_at_pos(registry.actor, createEmptyVector(), 0, sound_object.s2d);
      this.pdaSoundObject.volume = 0.8;
    }

    this.canPlaySound = false;
    this.soundObject = new sound_object(soundPath);
    this.soundObject.play_at_pos(object, object.position(), 0, sound_object.s3d);

    EventsManager.emitEvent<ISoundNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.SOUND,
      faction,
      point,
      soundPath,
    });

    return true;
  }

  /**
   * Stop the active sound and also stop and release the PDA sound object if it is playing.
   */
  public override stop(): void {
    super.stop();

    if (this.pdaSoundObject && this.pdaSoundObject.playing()) {
      this.pdaSoundObject.stop();
      this.pdaSoundObject = null;
    }
  }

  /**
   * Select the index of the next sound to play based on the configured playlist type.
   *
   * @returns Index of the next sound to play, -1 when the sequence is exhausted, or null when type is unknown.
   */
  public selectNextSound(): Nillable<TIndex> {
    const soundsCount: TCount = this.soundPaths.length();

    if (this.shuffle === ESoundPlaylistType.RANDOM) {
      if (soundsCount === 1) {
        return 1;
      } else if ($isNotNil(this.playedSoundIndex)) {
        const playedId: TNumberId = math.random(1, soundsCount - 1);

        if (playedId >= this.playedSoundIndex) {
          return playedId + 1;
        }

        return playedId;
      } else {
        return math.random(1, soundsCount);
      }
    }

    if (this.shuffle === ESoundPlaylistType.SEQUENCE) {
      if (this.playedSoundIndex === -1) {
        return -1;
      } else if ($isNil(this.playedSoundIndex)) {
        return 1;
      } else if (this.playedSoundIndex < soundsCount) {
        return this.playedSoundIndex + 1;
      } else {
        return -1;
      }
    }

    if (this.shuffle === ESoundPlaylistType.LOOP) {
      if ($isNil(this.playedSoundIndex)) {
        return 1;
      } else if (this.playedSoundIndex < soundsCount) {
        return this.playedSoundIndex + 1;
      } else {
        return 1;
      }
    }

    return null;
  }

  /**
   * Handle end of sound playback by resetting state, scheduling idle time and emitting scheme end signals.
   *
   * @param objectId - Id of the game object whose sound finished playing.
   */
  public override onSoundPlayEnded(objectId: TNumberId): void {
    logger.info(
      "Sound play ended: %s %s %s",
      objectId,
      this.playedSoundIndex,
      this.soundPaths.get(this.playedSoundIndex as TIndex)
    );

    this.playingStartedAt = time_global();
    this.idleTime = math.random(this.minIdle, this.maxIdle) * 1000;
    this.soundObject = null;
    this.canPlaySound = true;

    get_hud().RemoveCustomStatic("cs_subtitles_object");

    const state: IRegistryObjectState = registry.objects.get(objectId);

    if ($isNil(state.activeScheme)) {
      return;
    }

    const schemeState: IBaseSchemeState = state[state.activeScheme] as IBaseSchemeState;

    if (schemeState.signals) {
      if (this.playedSoundIndex === this.soundPaths.length() && this.shuffle !== ESoundPlaylistType.RANDOM) {
        logger.info("Emit sound end signal: %s", state.object.name());

        schemeState.signals.set("theme_end", true);
        schemeState.signals.set("sound_end", true);
      } else {
        logger.info("Emit sound end signal: %s", state.object.name());

        schemeState.signals.set("sound_end", true);
      }
    }
  }

  /**
   * Save the index of the last played sound to the save packet.
   *
   * @param packet - Net packet to write the sound state into.
   */
  public override save(packet: NetPacket): void {
    packet.w_stringZ(tostring(this.playedSoundIndex));
  }

  /**
   * Load the index of the last played sound from the save reader.
   *
   * @param reader - Net processor to read the sound state from.
   */
  public override load(reader: NetProcessor): void {
    const id: StringNillable<TStringId> = reader.r_stringZ();

    this.playedSoundIndex = id === NIL ? null : tonumber(id)!;
  }
}
