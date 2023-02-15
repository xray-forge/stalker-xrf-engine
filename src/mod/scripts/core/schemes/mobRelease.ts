import { XR_game_object } from "xray16";

/**
 * todo;
 * todo;
 * todo;
 */
export function mobRelease(object: XR_game_object, scriptName?: string) {
  if (object.get_script()) {
    object.script(false, "gamedata");
  }
}
