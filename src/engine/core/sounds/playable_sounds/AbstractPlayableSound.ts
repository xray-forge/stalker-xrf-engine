import { XR_ini_file, XR_net_packet, XR_reader, XR_sound_object } from "xray16";

import { EPlayableSound } from "@/engine/core/sounds/playable_sounds/EPlayableSound";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { AnyArgs, Optional, TNumberId, TRate } from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

/**
 * todo;
 */
export abstract class AbstractPlayableSound {
  public abstract readonly type: EPlayableSound;

  public path: string;
  public section: TSection;

  public snd_obj: Optional<XR_sound_object> = null;

  public play_always: boolean = false;

  /**
   * todo: Description.
   */
  public constructor(snd_ini: XR_ini_file, section: TSection) {
    this.path = readIniString(snd_ini, section, "path", true, "");
    this.section = section;
  }

  /**
   * todo: Description.
   */
  public is_playing(...args: AnyArgs): boolean {
    return this.snd_obj === null ? false : this.snd_obj.playing();
  }

  /**
   * todo: Description.
   */
  public stop(...args: AnyArgs): void {
    if (this.snd_obj !== null) {
      this.snd_obj.stop();
    }
  }

  /**
   * todo: Description.
   */
  public set_volume(level: TRate): void {
    if (this.snd_obj !== null) {
      this.snd_obj.volume = level;
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
  public callback(...args: AnyArgs): void {}

  /**
   * todo: Description.
   */
  public save(net_packet: XR_net_packet): void {}

  /**
   * todo: Description.
   */
  public load(reader: XR_reader): void {}

  /**
   * todo: Description.
   */
  public save_npc(net_packet: XR_net_packet, npcId: TNumberId): void {}

  /**
   * todo: Description.
   */
  public load_npc(net_packet: XR_reader, npcId: TNumberId): void {}
}
