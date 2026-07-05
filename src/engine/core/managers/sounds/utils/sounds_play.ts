import { GameObject } from "xray16/alias";

import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { TCommunity } from "@/engine/lib/constants/communities";

/**
 * Initialize NPC sound themes for the object whose community matches the theme requirements.
 *
 * @param object - Game object to initialize matching sound themes for.
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
