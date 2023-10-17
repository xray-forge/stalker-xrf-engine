import { EPlayableSound } from "@/engine/core/managers/sounds";
import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { TCommunity } from "@/engine/lib/constants/communities";
import { GameObject } from "@/engine/lib/types";

/**
 * todo;
 */
export function initializeObjectThemes(object: GameObject): void {
  const objectCommunity: TCommunity = getObjectCommunity(object);

  for (const [, sound] of soundsConfig.themes) {
    if (sound.type === EPlayableSound.NPC) {
      if ((sound as NpcSound).availableCommunities.has(objectCommunity)) {
        (sound as NpcSound).initializeObject(object);
      }
    }
  }
}
