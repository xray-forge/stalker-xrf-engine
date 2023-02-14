import { XR_game_object } from "xray16";

import { AnyCallable, Maybe } from "@/mod/lib/types";
import { reset_action } from "@/mod/scripts/core/schemes/reset_action";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * todo;
 * todo;
 * todo;
 */
export function mob_capture(mob: XR_game_object, reset_actions: Maybe<boolean>): void {
  if (reset_actions === null) {
    abort("mob_capture: reset_actions parameter's value is !specified");
  }

  if (reset_actions !== null) {
    reset_action(mob, get_global<AnyCallable>("script_name")());
  } else {
    if (!mob.get_script()) {
      mob.script(true, get_global<AnyCallable>("script_name")());
    }
  }
}
