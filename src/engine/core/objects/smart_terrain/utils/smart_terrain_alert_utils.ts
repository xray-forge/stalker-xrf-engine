import { CGameGraph, game_graph } from "xray16";
import { EGameObjectRelation, GameObject } from "xray16/alias";
import { TNumberId } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { getSimulationTerrainDescriptors } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";

/**
 * Handle object hit event and verify nearest bases to alert.
 *
 * Todo: Probably separate terrains alert manager.
 * Todo: Track controlled terrains separately, too many iterations on single hit event.
 *
 * @param object - Game object being hit.
 */
export function syncObjectHitSmartTerrainAlert(object: GameObject): void {
  // Generic enemy attack, no ambush etc.
  if (object.relation(registry.actor) === EGameObjectRelation.ENEMY) {
    return;
  }

  const graph: CGameGraph = game_graph();
  const actorVertexLevelId: TNumberId = graph.vertex(registry.actorServer.m_game_vertex_id).level_id();

  for (const [, descriptor] of getSimulationTerrainDescriptors()) {
    const terrain: SmartTerrain = descriptor.terrain;

    if (
      terrain.terrainControl &&
      graph.vertex(terrain.m_game_vertex_id).level_id() === actorVertexLevelId &&
      object.position().distance_to_sqr(terrain.position) <= 6_400
    ) {
      terrain.terrainControl.onActorAttackSmartTerrain();

      return;
    }
  }
}
