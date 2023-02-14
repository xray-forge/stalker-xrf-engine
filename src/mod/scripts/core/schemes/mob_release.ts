import { XR_game_object } from "xray16";

import { AnyCallable } from "@/mod/lib/types";

/**
 * todo;
 * todo;
 * todo;
 */
export function mob_release(mob: XR_game_object) {
  if (mob.get_script()) {
    mob.script(false, get_global<AnyCallable>("script_name")());
  }
}
