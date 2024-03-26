import { CGameGraph, game_graph } from "xray16";

import { getManager, registry } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { EGameObjectRelation, GameObject, TNumberId } from "@/engine/lib/types";

/**
 * Handle object hit event and verify nearest bases to alert.
 *
 * todo: Probably separate terrains alert manager.
 * todo: Track controlled terrains separately, too many iterations on single hit event.
 *
 * @param object - game object being hit
 */
export function syncObjectHitSmartTerrainAlert(object: GameObject): void {
  // Generic enemy attack, no ambush etc.
  if (object.relation(registry.actor) === EGameObjectRelation.ENEMY) {
    return;
  }

  const graph: CGameGraph = game_graph();
  const actorVertexLevelId: TNumberId = graph.vertex(registry.actorServer.m_game_vertex_id).level_id();

  for (const [, descriptor] of getManager(SimulationManager).getSmartTerrainDescriptors()) {
    const terrain: SmartTerrain = descriptor.smartTerrain;

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
