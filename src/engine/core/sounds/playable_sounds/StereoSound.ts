import { sound_object, time_global, XR_game_object, XR_sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TPath, TRate, TStringId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export class StereoSound {
  public soundObject: Optional<XR_sound_object> = null;
  public soundPath: Optional<string> = null;
  public soundEndTime: Optional<number> = null;

  /**
   * todo: Description.
   */
  public initialize(soundPath: TPath, volume: TRate): void {
    logger.info("Init stereo sound:", soundPath, volume);

    if (this.soundObject) {
      this.stop();
    }

    this.soundPath = soundPath;
    this.soundObject = new sound_object(soundPath);
    this.soundEndTime = null;

    if (!this.soundObject) {
      abort("StereoSound:initialize # Cannot open sound file " + soundPath);
    }

    this.soundObject.volume = volume;
  }

  /**
   * todo: Description.
   */
  public isPlaying(): boolean {
    return (this.soundObject && this.soundObject.playing()) === true;
  }

  /**
   * todo: Description.
   */
  public play(): TTimestamp {
    const actor: Optional<XR_game_object> = registry.actor;

    if (!actor) {
      abort("Unexpected play theme call: no actor present");
    } else if (!this.soundObject) {
      abort("Unexpected play theme call: no sound object initialized");
    }

    this.soundObject.play(actor, 0, sound_object.s2d);
    this.soundEndTime = time_global() + this.soundObject.length();

    logger.info("Play sound:", this.soundPath, this.soundEndTime, this.soundObject.volume);

    return this.soundEndTime;
  }

  /**
   * todo: Description.
   */
  public playAtTime(time: TTimestamp, sound: TStringId, volume: Optional<TRate>): TTimestamp {
    logger.info("Play sound at time:", sound);

    this.soundEndTime = null;
    this.soundObject!.attach_tail(sound);

    if (volume) {
      this.setVolume(volume);
    }

    const nextSound: Optional<XR_sound_object> = new sound_object(sound);

    if (!nextSound) {
      abort("StereoSound:initialize: Cannot open sound file " + sound);
    }

    this.soundEndTime = time + nextSound.length();

    return this.soundEndTime;
  }

  /**
   * todo: Description.
   */
  public update(volume: TRate): void {
    if (this.isPlaying()) {
      this.setVolume(volume);
    }
  }

  /**
   * todo: Description.
   */
  public stop(): void {
    if (this.soundObject && this.soundObject.playing()) {
      this.soundObject.stop();
    }
  }

  /**
   * todo: Description.
   */
  public setVolume(volume: TRate): void {
    if (this.soundObject) {
      this.soundObject.volume = volume;
    }
  }
}
