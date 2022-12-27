import { getActor, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/controls");

/**
 * todo;
 */
export function setInactiveInputTime(delta: number): void {
  const actor: XR_game_object = getActor()!;

  (storage.get(actor.id()) as any).disable_input_time = game.get_game_time();
  (storage.get(actor.id()) as any).disable_input_idle = delta;

  level.disable_input();
}
