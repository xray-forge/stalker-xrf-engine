import { device, game_graph } from "xray16";
import { $isNil, $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database/registry";

/**
 * Check whether game started.
 *
 * @returns Whether game is started and simulator is initialized.
 */
export function isGameStarted(): boolean {
  return $isNotNil(registry.simulator);
}

/**
 * Whether the game is still precaching (black screen up, sound muted, scene not yet live).
 *
 * The engine treats any non-zero `precache_frame` as "not live yet",
 * so the scene becomes live exactly when it reaches 0.
 *
 * @returns Whether currently black screen is visible and rendering is paused.
 */
export function isBlackScreen(): boolean {
  return device().precache_frame > 0;
}

/**
 * @returns Whether current game level is changing.
 */
export function isGameLevelChanging(): boolean {
  return $isNil(registry.simulator)
    ? false
    : game_graph().vertex(registry.actorServer.m_game_vertex_id).level_id() !== registry.simulator.level_id();
}
