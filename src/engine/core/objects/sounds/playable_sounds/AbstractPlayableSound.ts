import { TXR_net_processor, XR_game_object, XR_ini_file, XR_net_packet, XR_sound_object } from "xray16";

import { EPlayableSound } from "@/engine/core/objects/sounds/types";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { AnyArgs, Optional, TNumberId, TPath, TRate } from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

/**
 * todo;
 */
export abstract class AbstractPlayableSound {
  public abstract readonly type: EPlayableSound;

  public readonly section: TSection;
  public soundObject: Optional<XR_sound_object> = null;
  public path: TPath;
  public shouldPlayAlways: boolean = false;

  /**
   * todo: Description.
   */
  public constructor(ini: XR_ini_file, section: TSection) {
    this.path = readIniString(ini, section, "path", true, "");
    this.section = section;
  }

  /**
   * todo: Description.
   */
  public isPlaying(...args: AnyArgs): boolean {
    return this.soundObject === null ? false : this.soundObject.playing();
  }

  /**
   * todo: Description.
   */
  public stop(...args: AnyArgs): void {
    if (this.soundObject !== null) {
      this.soundObject.stop();
    }
  }

  /**
   * todo: Description.
   */
  public setVolume(level: TRate): void {
    if (this.soundObject !== null) {
      this.soundObject.volume = level;
    }
  }

  /**
   * todo: Description.
   */
  public abstract play(...args: AnyArgs): boolean;

  /**
   * todo: Description.
   */
  public reset(...args: AnyArgs): void {}

  /**
   * todo: Description.
   */
  public onSoundPlayEnded(objectId: TNumberId): void {}

  /**
   * todo: Description.
   */
  public save(packet: XR_net_packet): void {}

  /**
   * todo: Description.
   */
  public load(reader: TXR_net_processor): void {}

  /**
   * todo: Description.
   */
  public saveObject(packet: XR_net_packet, object: XR_game_object): void {}

  /**
   * todo: Description.
   */
  public loadObject(processor: TXR_net_processor, object: XR_game_object): void {}
}
