import { FS, get_hud, getFS, sound_object, time_global } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, ISoundNotification } from "@/engine/core/managers/notifications/notifications_types";
import { AbstractPlayableSound } from "@/engine/core/objects/sounds/playable_sounds/AbstractPlayableSound";
import { EPlayableSound, ESoundPlaylistType } from "@/engine/core/objects/sounds/sounds_types";
import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { assert } from "@/engine/core/utils/assertion";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { roots } from "@/engine/lib/constants/roots";
import { NIL } from "@/engine/lib/constants/words";
import {
  ClientObject,
  IniFile,
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  StringOptional,
  TCount,
  TDuration,
  TIndex,
  TNumberId,
  TPath,
  TSection,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: Probably enums for playlist types.
 */
export class ActorSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.ACTOR;

  public readonly type: EPlayableSound = ActorSound.type;
  public readonly soundPaths: LuaArray<TPath> = new LuaTable();

  public isStereo: boolean;
  public isPrefixed: boolean;
  public canPlaySound: boolean = true;

  public faction: string;
  public point: string;
  public message: string;
  public shuffle: ESoundPlaylistType;

  public playedSoundIndex: Optional<TIndex> = null;
  public playingStartedAt: Optional<TTimestamp> = null;

  public idleTime: Optional<TDuration> = null;
  public minIdle: TDuration;
  public maxIdle: TDuration;
  public random: number;

  public constructor(ini: IniFile, section: TSection) {
    super(ini, section);

    this.isStereo = readIniBoolean(ini, section, "actor_stereo", false, false);
    this.isPrefixed = readIniBoolean(ini, section, "npc_prefix", false, false);
    this.shuffle = readIniString(ini, section, "shuffle", false, "", ESoundPlaylistType.RANDOM) as ESoundPlaylistType;
    this.shouldPlayAlways = readIniBoolean(ini, section, "play_always", false, false);

    if (this.isPrefixed) {
      this.path = "characters_voice\\" + this.path;
    }

    const interval = parseStringsList(readIniString(ini, section, "idle", false, "", "3,5,100"));

    this.minIdle = tonumber(interval.get(1))!;
    this.maxIdle = tonumber(interval.get(2))!;
    this.random = tonumber(interval.get(3))!;
    this.faction = readIniString(ini, section, "faction", false, "", "");
    this.point = readIniString(ini, section, "point", false, "", "");
    this.message = readIniString(ini, section, "message", false, "", "");

    const fs: FS = getFS();

    if (fs.exist(roots.gameSounds, this.path + ".ogg") !== null) {
      this.soundPaths.set(1, this.path);
    } else {
      let index: TCount = 1;

      while (fs.exist(roots.gameSounds, this.path + index + ".ogg")) {
        this.soundPaths.set(index, this.path + index);
        index = index + 1;
      }
    }

    assert(this.soundPaths.length() > 0, "There are no sound collection with path: '%s'.", this.path);
  }

  /**
   * todo;
   */
  public play(object: ClientObject, faction: string, point: string, message: string): boolean {
    if (!this.canPlaySound) {
      return false;
    }

    if (this.playingStartedAt !== null && time_global() - this.playingStartedAt < this.idleTime!) {
      return false;
    }

    this.playingStartedAt = null;
    this.playedSoundIndex = this.selectNextSound();

    if (this.playedSoundIndex === -1) {
      return false;
    }

    const soundPath: TPath = this.soundPaths.get(this.playedSoundIndex!);

    this.soundObject = new sound_object(soundPath);
    this.soundObject.volume = 0.8;
    this.soundObject.play_at_pos(registry.actor, createEmptyVector(), 0, sound_object.s2d);
    this.soundObject.volume = 0.8;
    this.canPlaySound = false;

    EventsManager.emitEvent<ISoundNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.SOUND,
      faction,
      point,
      soundPath,
    });

    return true;
  }

  /**
   * todo;
   */
  public override onSoundPlayEnded(objectId: TNumberId): void {
    logger.info(
      "Sound play ended:",
      objectId,
      this.playedSoundIndex,
      this.soundPaths.get(this.playedSoundIndex as TIndex)
    );

    this.playingStartedAt = time_global();
    this.idleTime = math.random(this.minIdle, this.maxIdle) * 1000;
    this.soundObject = null;
    this.canPlaySound = true;

    get_hud().RemoveCustomStatic("cs_subtitles_actor");

    const objectState: IRegistryObjectState = registry.objects.get(objectId);

    if (!objectState.activeScheme || objectState[objectState.activeScheme!]!.signals === null) {
      return;
    }

    const schemeState: IBaseSchemeState = objectState[objectState.activeScheme] as IBaseSchemeState;

    if (this.playedSoundIndex === this.soundPaths.length() && this.shuffle !== "rnd") {
      logger.info("Emit sound end signal:", objectState.object.name());
      schemeState.signals!.set("theme_end", true);
      schemeState.signals!.set("sound_end", true);
    } else {
      schemeState.signals!.set("sound_end", true);
    }
  }

  /**
   * todo;
   */
  public selectNextSound(): Optional<TIndex> {
    const soundsCount: TCount = this.soundPaths.length();

    // Play one from the list.
    if (this.shuffle === ESoundPlaylistType.RANDOM) {
      if (soundsCount === 1) {
        return 1;
      } else if (this.playedSoundIndex !== null) {
        const playedSoundIndex: TIndex = math.random(1, soundsCount - 1);

        if (playedSoundIndex === this.playedSoundIndex) {
          return playedSoundIndex + 1;
        }

        return playedSoundIndex;
      }

      return math.random(1, soundsCount);
    }

    // Play sounds in from first to last, then end.
    if (this.shuffle === ESoundPlaylistType.SEQUENCE) {
      if (this.playedSoundIndex === -1) {
        return -1;
      } else if (this.playedSoundIndex === null) {
        return 1;
      } else if (this.playedSoundIndex < soundsCount) {
        return this.playedSoundIndex + 1;
      } else {
        return -1;
      }
    }

    // Play sounds in a loop, from first to last.
    if (this.shuffle === ESoundPlaylistType.LOOP) {
      if (this.playedSoundIndex === null) {
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
   * todo;
   */
  public override reset(): void {
    this.playingStartedAt = null;
    this.playedSoundIndex = null;
  }

  /**
   * todo;
   */
  public override save(packet: NetPacket): void {
    packet.w_stringZ(tostring(this.playedSoundIndex));
  }

  /**
   * todo;
   */
  public override load(reader: NetProcessor): void {
    const id: StringOptional<TStringId> = reader.r_stringZ();

    this.playedSoundIndex = id === NIL ? null : tonumber(id)!;
  }
}
