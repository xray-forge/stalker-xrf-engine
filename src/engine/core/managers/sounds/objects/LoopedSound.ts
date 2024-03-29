import { getFS, sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects/AbstractPlayableSound";
import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { assert } from "@/engine/core/utils/assertion";
import { roots } from "@/engine/lib/constants/roots";
import { GameObject, IniFile, Optional, TNumberId, TSection, TSoundObjectType } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export class LoopedSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.LOOPED;

  public readonly type: EPlayableSound = LoopedSound.type;

  public constructor(ini: IniFile, section: TSection) {
    super(ini, section);

    assert(
      getFS().exist(roots.gameSounds, this.path + ".ogg") !== null,
      "There are no looped sound with path: '%s'",
      this.path
    );
  }

  /**
   * todo: Description.
   */
  public play(objectId: TNumberId): boolean {
    const object: Optional<GameObject> = registry.objects.get(objectId).object!;

    if (object === null) {
      return false;
    } else {
      this.soundObject = new sound_object(this.path);
      this.soundObject.play_at_pos(
        object,
        object.position(),
        0,
        // todo: Check if bitmasking originally works. 1+0=1 so probably no point in a such play.
        (sound_object.s3d + sound_object.looped) as TSoundObjectType
      );

      return true;
    }
  }
}
