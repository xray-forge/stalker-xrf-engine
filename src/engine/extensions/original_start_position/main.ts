import { set_start_game_vertex_id, set_start_position } from "xray16";
import { createVector, TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Original start position";
export const enabled: boolean = false;

export function register(isNewGame: boolean): void {
  logger.info("Original start extension register: %s", isNewGame);

  if (isNewGame) {
    set_start_game_vertex_id(287);
    set_start_position(createVector(268, 20, 560));
  }
}
