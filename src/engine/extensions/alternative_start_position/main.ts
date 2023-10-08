import { set_start_game_vertex_id, set_start_position } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { createVector } from "@/engine/core/utils/vector";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const name: TName = "Alternative start position";
export const enabled: boolean = false;

export function register(): void {
  logger.info("Alternative start extension register");

  set_start_game_vertex_id(212);
  set_start_position(createVector(-307.5, 16.5, 550.5));
}