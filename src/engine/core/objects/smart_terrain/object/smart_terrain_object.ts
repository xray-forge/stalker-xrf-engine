import { game_graph } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { ESquadActionType, Squad } from "@/engine/core/objects/squad";
import { GameGraphVertex, GameObject, Optional, ServerCreatureObject, Vector } from "@/engine/lib/types";

/**
 * @returns whether object has arrived to the smart terrain
 */
export function isObjectArrivedToSmartTerrain(object: ServerCreatureObject, smartTerrain: SmartTerrain): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id) as Optional<IRegistryObjectState>;

  let objectGameVertex: GameGraphVertex;
  let objectPosition: Vector;

  if (state) {
    const it: GameObject = registry.objects.get(object.id).object!;

    objectGameVertex = game_graph().vertex(it.game_vertex_id());
    objectPosition = it.position();
  } else {
    objectGameVertex = game_graph().vertex(object.m_game_vertex_id);
    objectPosition = object.position;
  }

  const smartTerrainGameVertex: GameGraphVertex = game_graph().vertex(smartTerrain.m_game_vertex_id);

  // todo: Check max u16 instead?
  if (object.group_id !== null) {
    const squad: Squad = smartTerrain.simulationBoardManager.getSquads().get(object.group_id);

    if (squad !== null && squad.currentAction) {
      if (squad.currentAction.type === ESquadActionType.REACH_TARGET) {
        const squadTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assignedTargetId!);

        if (squadTarget !== null) {
          return squadTarget.isReachedBySquad(squad);
        } else {
          return registry.simulator.object<SmartTerrain>(squad.assignedTargetId!)!.isReachedBySquad(squad);
        }
      } else if (squad.currentAction.type === ESquadActionType.STAY_ON_TARGET) {
        return true;
      }
    }
  }

  return (
    objectGameVertex.level_id() === smartTerrainGameVertex.level_id() &&
    objectPosition.distance_to_sqr(smartTerrain.position) <= 10000
  );
}
