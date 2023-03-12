import { sound_object, time_global, XR_game_object, XR_sound_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

export class StereoSound {
  public soundObject: Optional<XR_sound_object> = null;
  public soundPath: Optional<string> = null;
  public soundEndTime: Optional<number> = null;

  public initialize(soundPath: string, volume: number): void {
    logger.info("Init sound object:", soundPath, volume);

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

  public isPlaying(): boolean {
    return (this.soundObject && this.soundObject.playing()) === true;
  }

  public play(): number {
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

  public playAtTime(time: number, sound: string, volume: Optional<number>): number {
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

  public update(volume: number): void {
    if (this.isPlaying()) {
      this.setVolume(volume);
    }
  }

  public stop(): void {
    if (this.soundObject && this.soundObject.playing()) {
      this.soundObject.stop();
    }
  }

  public setVolume(volume: number): void {
    if (this.soundObject) {
      this.soundObject.volume = volume;
    }
  }
}
