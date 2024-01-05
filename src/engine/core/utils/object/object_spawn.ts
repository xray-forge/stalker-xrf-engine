import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { ISmartTerrainJobDescriptor, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { assert } from "@/engine/core/utils/assertion";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ALifeSmartTerrainTask, GameObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Handle object position sync when net spawn event is happening.
 *
 * @param object - game object
 * @param smartTerrainId - target object linked smart terrain id
 */
export function syncSpawnedObjectPosition(object: GameObject, smartTerrainId: Optional<TNumberId> = null): void {
  const objectId: TNumberId = object.id();

  if (registry.spawnedVertexes.has(objectId)) {
    object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(objectId)));
    registry.spawnedVertexes.delete(objectId);
  } else if (registry.offlineObjects.get(objectId)?.levelVertexId) {
    object.set_npc_position(level.vertex_position(registry.offlineObjects.get(objectId).levelVertexId as TNumberId));
  } else if (smartTerrainId && smartTerrainId !== MAX_U16) {
    const smartTerrain: SmartTerrain = registry.simulator.object<SmartTerrain>(smartTerrainId)!;

    if (!smartTerrain.arrivingObjects.get(objectId)) {
      const job: Optional<ISmartTerrainJobDescriptor> = smartTerrain.objectJobDescriptors.get(objectId)?.job;
      const task: ALifeSmartTerrainTask = job?.alifeTask as ALifeSmartTerrainTask;

      assert(
        task,
        "Expected terrain task to exist when spawning in smart terrain: '%s' in '%s', job: '%s'.",
        object.name(),
        smartTerrain.name(),
        job?.section
      );

      object.set_npc_position(task.position());
    }
  }
}
