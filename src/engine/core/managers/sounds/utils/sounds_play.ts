import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { ClientObject } from "@/engine/lib/types";

/**
 * todo;
 */
export function initializeObjectSounds(object: ClientObject): void {
  for (const [, sound] of soundsConfig.themes) {
    if (sound.type === NpcSound.type) {
      if ((sound as NpcSound).availableCommunities.has(getObjectCommunity(object))) {
        (sound as NpcSound).initializeObject(object);
      }
    }
  }
}
