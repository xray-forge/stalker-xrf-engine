import { TNumberId } from "xray16/lib";

import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";

/**
 * Forget per-object NPC sound registrations when the object goes offline.
 *
 * Engine-side sound registrations die with the client object, so descriptors kept from the previous
 * online cycle would silently no-op on play. NPC themes are registered lazily on first play request,
 * so no re-initialization happens until a sound is actually needed.
 *
 * @param objectId - Identifier of the game object to invalidate sound themes for.
 */
export function invalidateObjectThemes(objectId: TNumberId): void {
  for (const [, sound] of soundsConfig.themes) {
    if (sound.type === EPlayableSound.NPC) {
      (sound as NpcSound).invalidateObject(objectId);
    }
  }
}
