import { getFS, sound_object, TXR_sound_object_type, XR_game_object, XR_ini_file } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractPlayableSound } from "@/engine/core/sounds/playable_sounds/AbstractPlayableSound";
import { EPlayableSound } from "@/engine/core/sounds/playable_sounds/EPlayableSound";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { roots } from "@/engine/lib/constants/roots";
import { Optional, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export class LoopedSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.LOOPED;

  public readonly type: EPlayableSound = LoopedSound.type;

  public sound: string;

  /**
   * todo: Description.
   */
  public constructor(soundIni: XR_ini_file, section: TSection) {
    super(soundIni, section);

    if (getFS().exist(roots.gameSounds, this.path + ".ogg") !== null) {
      this.sound = this.path;
    } else {
      abort("There are no looped sound with path: %s", this.path);
    }
  }

  /**
   * todo: Description.
   */
  public play(objectId: TNumberId): boolean {
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
