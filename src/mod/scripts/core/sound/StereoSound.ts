import { sound_object, time_global, XR_game_object, XR_sound_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StereoSound");

export class StereoSound {
  public both: Optional<XR_sound_object> = null;
  public end_time: Optional<number> = null;

  public initialize(sound: string, volume: Optional<number>): void {
    log.info("Init sound object:", sound, volume);

    if (this.both) {
      this.stop();
    }

    this.both = new sound_object(sound);
    this.end_time = null;

    if (!this.both) {
      abort("StereoSound:initialize # Cannot open sound file " + sound);
    }

    if (volume) {
      this.set_volume(volume);
    }
  }

  public play(): Optional<number> {
    log.info("Play");

    const actor: Optional<XR_game_object> = getActor();

    if (!actor) {
      return null;
    }

    this.both!.play(actor, 0, sound_object.s2d);
    this.end_time = time_global() + this.both!.length();

    return this.end_time;
  }

  public play_at_time(time: number, sound: string, volume: Optional<number>): number {
    this.end_time = null;
    this.both!.attach_tail(sound);

    if (volume) {
      this.set_volume(volume);
    }

    const both_tail: Optional<XR_sound_object> = new sound_object(sound);

    if (!both_tail) {
      abort("StereoSound:initialize: Cannot open sound file " + sound);
    }

    this.end_time = time + both_tail.length();

    return this.end_time;
  }

  public playing(): boolean {
    return (this.both && this.both.playing()) === true;
  }

  public update(volume: Optional<number>): void {
    if (volume && this.playing()) {
      this.set_volume(volume);
    }
  }

  public stop(): void {
    if (this.both && this.both.playing()) {
      this.both.stop();
    }
  }

  public length(): number {
    return (this.both && this.both.length()) || 1;
  }

  public set_volume(num: number): void {
    if (this.both) {
      this.both.volume = num;
    }
  }
}
