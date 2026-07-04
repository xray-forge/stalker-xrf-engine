import { CGameGraph, game_graph } from "xray16";
import { $isNil, $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { type TSimulationObject } from "@/engine/core/managers/simulation";
import { getSimulationSquads } from "@/engine/core/managers/simulation/utils";
import { type SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { ESquadActionType, Squad } from "@/engine/core/objects/squad";
import { GameGraphVertex, GameObject, Nillable, ServerCreatureObject, Vector } from "@/engine/lib/types";

/**
 * @param object - Server object to check.
 * @param terrain - Target smart terrain to check reached state.
 * @returns Whether object has arrived to the smart terrain.
 */
export function isObjectArrivedToTerrain(object: ServerCreatureObject, terrain: SmartTerrain): boolean {
  // Do squad based checks for object if possible.
  // todo: Check max u16 instead?
  const squad: Nillable<Squad> = $isNil(object.group_id) ? null : getSimulationSquads().get(object.group_id);

  if (squad) {
    const isSquadArrived: Nillable<boolean> = isSquadArrivedToTerrain(squad);

    // When sure about squad status, return it.
    // Check object otherwise.
    if ($isNotNil(isSquadArrived)) {
      return isSquadArrived;
    }
  }

  const graph: CGameGraph = game_graph();
  const smartTerrainGameVertex: GameGraphVertex = graph.vertex(terrain.m_game_vertex_id);
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id) as Nillable<IRegistryObjectState>;

  let objectGameVertex: GameGraphVertex;
  let objectPosition: Vector;

  // Check more detailed online object position if possible.
  if (state) {
    const gameObject: GameObject = state.object!;

    objectGameVertex = graph.vertex(gameObject.game_vertex_id());
    objectPosition = gameObject.position();
  } else {
    objectGameVertex = graph.vertex(object.m_game_vertex_id);
    objectPosition = object.position;
  }

  return (
    objectGameVertex.level_id() === smartTerrainGameVertex.level_id() &&
    objectPosition.distance_to_sqr(terrain.position) <= 10_000 // 100 * 100
  );
}

/**
 * @param squad - Squad object to check.
 * @returns Whether object has arrived to the smart terrain.
 */
export function isSquadArrivedToTerrain(squad: Squad): Nillable<boolean> {
  switch (squad.currentAction?.type) {
    case ESquadActionType.REACH_TARGET: {
      const squadTarget: TSimulationObject =
        registry.simulationObjects.get(squad.assignedTargetId!) ??
        registry.simulator.object<SmartTerrain>(squad.assignedTargetId!)!;

      return squadTarget.isReachedBySimulationObject(squad);
    }

    case ESquadActionType.STAY_ON_TARGET:
      return true;

    default:
      return null;
  }
}
