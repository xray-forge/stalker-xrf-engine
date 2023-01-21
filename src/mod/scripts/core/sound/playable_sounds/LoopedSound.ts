import { getFS, sound_object, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/EPlayableSound";
import { abort } from "@/mod/scripts/utils/debug";

export class LoopedSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.LOOPED;

  public readonly class_id: EPlayableSound = LoopedSound.type;

  public sound: string;

  public constructor(snd_ini: XR_ini_file, section: string) {
    super(snd_ini, section);

    if (getFS().exist("$game_sounds$", this.path + ".ogg") !== null) {
      this.sound = this.path;
    } else {
      abort("There are no looped sound with path: %s", this.path);
    }
  }

  public play(obj_id: number): boolean {
    const obj: Optional<XR_game_object> = storage.get(obj_id).object!;

    if (obj === null) {
      return false;
    } else {
      this.snd_obj = new sound_object(this.sound);
      this.snd_obj.play_at_pos(obj, obj.position(), 0, sound_object.s3d + sound_object.looped);

      return true;
    }
  }
}
