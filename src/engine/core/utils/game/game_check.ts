import { alife, device, game_graph, IsGameTypeSingle } from "xray16";

import { AlifeSimulator, Optional } from "@/engine/lib/types";

/**
 * Check whether game started.
 *
 * @returns whether game is started and simulator is initialized
 */
export function isGameStarted(): boolean {
  return alife() !== null;
}

/**
 * todo
 */
export function isSinglePlayerGame(): boolean {
  if (alife === null || alife() !== null) {
    return true;
  } else if (IsGameTypeSingle === null || IsGameTypeSingle()) {
    return true;
  }

  return false;
}

/**
 * @returns whether currently black screen is visible and rendering is paused.
 */
export function isBlackScreen(): boolean {
  return device().precache_frame > 1;
}

/**
 * @returns whether current game level is changing.
 */
export function isGameLevelChanging(): boolean {
  const simulator: Optional<AlifeSimulator> = alife();

  return simulator === null
    ? false
    : game_graph().vertex(simulator.actor().m_game_vertex_id).level_id() !== simulator.level_id();
}
