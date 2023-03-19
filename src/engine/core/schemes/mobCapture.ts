import { XR_game_object } from "xray16";

import { abort } from "@/engine/core/utils/debug";
import { resetObjectAction } from "@/engine/core/utils/object";
import { Maybe } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * todo;
 */
export function mobCapture(object: XR_game_object, resetActions: Maybe<boolean>, scriptName?: string): void {
  if (resetActions === null) {
    abort("mob_capture: reset_actions parameter's value is !specified");
  }

  if (resetActions !== null) {
    resetObjectAction(object, "gamedata");
  } else {
    if (!object.get_script()) {
      object.script(true, "gamedata");
    }
  }
}
