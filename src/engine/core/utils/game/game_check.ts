import { device, game_graph } from "xray16";

import { registry } from "@/engine/core/database/registry";

/**
 * Check whether game started.
 *
 * @returns whether game is started and simulator is initialized
 */
export function isGameStarted(): boolean {
  return registry.simulator !== null;
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
  return registry.simulator === null
    ? false
    : game_graph().vertex(registry.actorServer.m_game_vertex_id).level_id() !== registry.simulator.level_id();
}
