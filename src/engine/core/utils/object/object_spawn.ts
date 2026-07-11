import { level } from "xray16";
import { ALifeSmartTerrainTask, GameObject } from "xray16/alias";
import { assert, MAX_ALIFE_ID, Nillable, TNumberId } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { ISmartTerrainJobDescriptor, SmartTerrain } from "@/engine/core/objects/smart_terrain";

/**
 * Handle object position sync when net spawn event is happening.
 *
 * @param object - Game object.
 * @param terrainId - Target object linked smart terrain id.
 */
export function setupSpawnedObjectPosition(object: GameObject, terrainId: Nillable<TNumberId> = null): void {
  const objectId: TNumberId = object.id();

  if (registry.spawnedVertexes.has(objectId)) {
    object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(objectId)));
    registry.spawnedVertexes.delete(objectId);
  } else if (registry.offlineObjects.get(objectId)?.levelVertexId) {
    object.set_npc_position(level.vertex_position(registry.offlineObjects.get(objectId)!.levelVertexId as TNumberId));
  } else if (terrainId && terrainId !== MAX_ALIFE_ID) {
    const terrain: SmartTerrain = registry.simulator.object<SmartTerrain>(terrainId)!;

    if (!terrain.arrivingObjects.get(objectId)) {
      const job: Nillable<ISmartTerrainJobDescriptor> = terrain.objectJobDescriptors.get(objectId)?.job;
      const task: ALifeSmartTerrainTask = job?.alifeTask as ALifeSmartTerrainTask;

      assert(
        task,
        "Expected terrain task to exist when spawning in smart terrain: '%s' in '%s', job: '%s'.",
        object.name(),
        terrain.name(),
        job?.section
      );

      object.set_npc_position(task.position());
    }
  }
}
