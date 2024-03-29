import { sound_object, time_global } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, SoundObject, TPath, TRate, TStringId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Stereo sound script object representation.
 */
export class StereoSound {
  public soundObject: Optional<SoundObject> = null;
  public soundPath: Optional<TPath> = null;
  public soundEndTime: Optional<TTimestamp> = null;

  /**
   * Initialize object instance.
   */
  public initialize(soundPath: TPath, volume: TRate): void {
    logger.info("Init stereo sound: %s %s", soundPath, volume);

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

    const now: TTimestamp = time_global();

    this.soundObject.play(registry.actor, 0, sound_object.s2d);
    this.soundEndTime = now + this.soundObject.length();

    logger.info("Play stereo sound: %s, %s -> %s, %s", this.soundPath, now, this.soundEndTime, this.soundObject.volume);

    return this.soundEndTime;
  }

  /**
   * Play stereo sound at specified time.
   */
  public playAtTime(time: TTimestamp, sound: TStringId, volume: Optional<TRate>): TTimestamp {
    logger.info("Play stereo sound at time: %s %s %s", sound, time, volume);

    this.soundEndTime = null;
    (this.soundObject as sound_object).attach_tail(sound);

    if (volume) {
      this.setVolume(volume);
    }

    const nextSound: Optional<sound_object> = new sound_object(sound);

    assert(nextSound, "StereoSound: cannot open sound file '%s'.", sound);

    this.soundEndTime = time + nextSound.length();

    return this.soundEndTime;
  }

  /**
   * Perform update tick for sound object.
   */
  public update(volume: TRate): void {
    if (this.soundObject?.playing()) {
      this.soundObject.volume = volume;
    }
  }

  /**
   * Stop playing stereo sound.
   */
  public stop(): void {
    if (this.soundObject && this.soundObject.playing()) {
      logger.info("Stop playing stereo sound: %s %s", this.soundPath, this.soundObject.volume);
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
