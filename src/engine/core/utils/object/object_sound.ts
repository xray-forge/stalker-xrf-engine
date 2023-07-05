import { ClientObject } from "@/engine/lib/types";

/**
 * Stop playing sound for client game object.
 *
 * @param object - target object to stop playing
 */
export function stopPlayingObjectSound(object: ClientObject): void {
  if (object.alive()) {
    object.set_sound_mask(-1);
    object.set_sound_mask(0);
  }
}
