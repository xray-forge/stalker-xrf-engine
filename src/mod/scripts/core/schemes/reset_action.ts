import { XR_game_object } from "xray16";

/**
 * todo;
 * todo;
 * todo;
 */
export function reset_action(npc: XR_game_object, script_name: string) {
  if (npc.get_script()) {
    npc.script(false, script_name);
  }

  npc.script(true, script_name);
}
