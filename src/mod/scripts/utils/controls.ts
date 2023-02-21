import { game, level, XR_game_object } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("controls");

/**
 * todo;
 */
export function setInactiveInputTime(delta: number): void {
  const actor: XR_game_object = registry.actor;

  registry.objects.get(actor.id()).disable_input_time = game.get_game_time();
  registry.objects.get(actor.id()).disable_input_idle = delta;

  level.disable_input();
}
