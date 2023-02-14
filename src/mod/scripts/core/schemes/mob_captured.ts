import { XR_game_object } from "xray16";

/**
 * todo;
 * todo;
 * todo;
 */
export function mob_captured(object: XR_game_object): boolean {
  return object.get_script() !== null;
}
