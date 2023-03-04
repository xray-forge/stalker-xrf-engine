import { XR_ini_file, XR_net_packet, XR_reader, XR_sound_object } from "xray16";

import { AnyArgs, Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/scheme";
import { EPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/EPlayableSound";
import { getConfigString } from "@/mod/scripts/utils/configs";

export abstract class AbstractPlayableSound {
  public abstract readonly type: EPlayableSound;

  public path: string;
  public section: TSection;

  public snd_obj: Optional<XR_sound_object> = null;

  public play_always: boolean = false;

  public constructor(snd_ini: XR_ini_file, section: TSection) {
    this.path = getConfigString(snd_ini, section, "path", null, true, "");
    this.section = section;
  }

  public is_playing(...args: AnyArgs): boolean {
    return this.snd_obj === null ? false : this.snd_obj.playing();
  }

  public stop(...args: AnyArgs): void {
    if (this.snd_obj !== null) {
      this.snd_obj.stop();
    }
  }

  public set_volume(level: number): void {
    if (this.snd_obj !== null) {
      this.snd_obj.volume = level;
    }
  }

  public abstract play(...args: AnyArgs): boolean;

  public reset(...args: AnyArgs): void {}

  public callback(...args: AnyArgs): void {}

  public save(net_packet: XR_net_packet): void {}

  public load(reader: XR_reader): void {}

  public save_npc(net_packet: XR_net_packet, npcId: number): void {}

  public load_npc(net_packet: XR_reader, npcId: number): void {}
}
