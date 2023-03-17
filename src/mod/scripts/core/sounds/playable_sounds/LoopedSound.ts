import { getFS, sound_object, TXR_sound_object_type, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractPlayableSound } from "@/mod/scripts/core/sounds/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/mod/scripts/core/sounds/playable_sounds/EPlayableSound";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

export class LoopedSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.LOOPED;

  public readonly type: EPlayableSound = LoopedSound.type;

  public sound: string;

  public constructor(snd_ini: XR_ini_file, section: string) {
    super(snd_ini, section);

    if (getFS().exist("$game_sounds$", this.path + ".ogg") !== null) {
      this.sound = this.path;
    } else {
      abort("There are no looped sound with path: %s", this.path);
    }
  }

  public play(objectId: number): boolean {
    const object: Optional<XR_game_object> = registry.objects.get(objectId).object!;

    if (object === null) {
      return false;
    } else {
      this.snd_obj = new sound_object(this.sound);
      this.snd_obj.play_at_pos(
        object,
        object.position(),
        0,
        // todo: Check if bitmasking originally works. 1+0=1 so probably no point in a such play.
        (sound_object.s3d + sound_object.looped) as TXR_sound_object_type
      );

      return true;
    }
  }
}
