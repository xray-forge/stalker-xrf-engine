import { sound_object, time_global, XR_sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TPath, TRate, TStringId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Stereo sound script object representation.
 */
export class StereoSound {
  public soundObject: Optional<XR_sound_object> = null;
  public soundPath: Optional<TPath> = null;
  public soundEndTime: Optional<TTimestamp> = null;

  /**
   * Initialize object instance.
   */
  public initialize(soundPath: TPath, volume: TRate): void {
    logger.info("Init stereo sound:", soundPath, volume);

    if (this.soundObject) {
      this.stop();
    }

    this.soundPath = soundPath;
    this.soundObject = new sound_object(soundPath);
    this.soundEndTime = null;

    assert(this.soundObject, "StereoSound: cannot open sound file '%s'.", soundPath);

    this.soundObject.volume = volume;
  }

  /**
   * @returns whether object is playing now
   */
  public isPlaying(): boolean {
    return this.soundObject?.playing() === true;
  }

  /**
   * Start playing game sound.
   */
  public play(): TTimestamp {
    assert(registry.actor, "Unexpected play theme call: no actor present.");
    assert(this.soundObject, "Unexpected play theme call: no sound object initialized.");

    this.soundObject.play(registry.actor, 0, sound_object.s2d);
    this.soundEndTime = time_global() + this.soundObject.length();

    logger.info("Play stereo sound:", this.soundPath, this.soundEndTime, this.soundObject.volume);

    return this.soundEndTime;
  }

  /**
   * Play stereo sound at specified time.
   */
  public playAtTime(time: TTimestamp, sound: TStringId, volume: Optional<TRate>): TTimestamp {
    logger.info("Play stereo sound at time:", sound);

    this.soundEndTime = null;
    (this.soundObject as XR_sound_object).attach_tail(sound);

    if (volume) {
      this.setVolume(volume);
    }

    const nextSound: Optional<XR_sound_object> = new sound_object(sound);

    assert(nextSound, "StereoSound: cannot open sound file '%s'.", sound);

    this.soundEndTime = time + nextSound.length();

    return this.soundEndTime;
  }

  /**
   * Perform update tick for sound object.
   */
  public update(volume: TRate): void {
    if (this.isPlaying()) {
      this.setVolume(volume);
    }
  }

  /**
   * Stop playing stereo sound.
   */
  public stop(): void {
    if (this.soundObject && this.soundObject.playing()) {
      logger.info("Stop playing stereo sound:", this.soundPath, this.soundObject.volume);
      this.soundObject.stop();
    }
  }

  /**
   * Set stereo sound volume.
   */
  public setVolume(volume: TRate): void {
    if (this.soundObject) {
      this.soundObject.volume = volume;
    }
  }
}
