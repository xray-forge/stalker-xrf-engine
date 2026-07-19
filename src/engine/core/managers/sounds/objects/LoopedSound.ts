import { getFS, sound_object } from "xray16";
import { GameObject, IniFile, TSoundObjectType } from "xray16/alias";
import { assert, Nillable, TNumberId, TSection } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { roots } from "@/engine/constants/roots";
import { registry } from "@/engine/core/database";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects/AbstractPlayableSound";
import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";

/**
 * Playable sound that loops continuously at the position of a game object.
 */
export class LoopedSound extends AbstractPlayableSound {
  public static readonly type: EPlayableSound = EPlayableSound.LOOPED;

  public readonly type: EPlayableSound = LoopedSound.type;

  public constructor(ini: IniFile, section: TSection) {
    super(ini, section);

    assert(getFS().exist(roots.gameSounds, this.path + ".ogg"), "There are no looped sound with path: '%s'", this.path);
  }

  /**
   * Play the looped sound at the position of the target object.
   *
   * @param objectId - Identifier of the object to play the looped sound at.
   * @returns Whether the looped sound started playing successfully.
   */
  public play(objectId: TNumberId): boolean {
    const object: Nillable<GameObject> = registry.objects.get(objectId).object!;

    if ($isNil(object)) {
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
