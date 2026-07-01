import { game_graph } from "xray16";

import { registry } from "@/engine/core/database";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { GameObject, Nillable, TDistance, TName, TNumberId } from "@/engine/lib/types";

/**
 * Check whether provided vertex ID is from level.
 *
 * @param levelName - Target level to expect.
 * @param gameVertexId - Game vertex id to check level.
 * @returns Whether gameVertexId is part of level with name `levelName`.
 */
export function isGameVertexFromLevel(levelName: TName, gameVertexId: TNumberId): boolean {
  return levelName === registry.simulator.level_name(game_graph().vertex(gameVertexId).level_id());
}

/**
 * Get graph distance between two vertexes.
 *
 * @param firstVertexId - From vertex id.
 * @param secondVertexId - To vertex id.
 * @returns Distance between vertexes.
 */
export function graphDistance(firstVertexId: TNumberId, secondVertexId: TNumberId): TDistance {
  return game_graph().vertex(firstVertexId).game_point().distance_to(game_graph().vertex(secondVertexId).game_point());
}

/**
 * Get squared graph distance between two vertexes.
 *
 * @param firstVertexId - From vertex id.
 * @param secondVertexId - To vertex id.
 * @returns Squared distance between vertexes.
 */
export function graphDistanceSqr(firstVertexId: TNumberId, secondVertexId: TNumberId): TDistance {
  return game_graph()
    .vertex(firstVertexId)
    .game_point()
    .distance_to_sqr(game_graph().vertex(secondVertexId).game_point());
}

/**
 * @param object - Object to validate vertex against.
 * @param vertexId - Vertex ID to check.
 * @returns Whether provided vertex is valid and can be accessed by the object.
 */
export function isValidAccessibleVertex(object: GameObject, vertexId: Nillable<TNumberId>): boolean {
  return $isNotNil(vertexId) && vertexId < MAX_U32 && object.accessible(vertexId);
}
