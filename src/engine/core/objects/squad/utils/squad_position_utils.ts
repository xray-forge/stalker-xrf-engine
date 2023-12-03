import { level } from "xray16";

import { registry, resetStalkerState } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorToString } from "@/engine/core/utils/vector";
import { GameObject, Optional, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Set squad position in current level by supplied vector.
 * Works within one level limits.
 *
 * @param squad - target squad to change position
 * @param position - new squad position
 */
export function setSquadPosition(squad: Squad, position: Vector): void {
  logger.format("Set squad position: '%s', '%s', '%s'", squad.name(), squad.online, vectorToString(position));

  if (!squad.online) {
    squad.force_change_position(position);
  }

  for (const squadMember of squad.squad_members()) {
    const object: Optional<GameObject> = registry.objects.get(squadMember.id)?.object as Optional<GameObject>;

    registry.offlineObjects.get(squadMember.id).levelVertexId = level.vertex_id(position);

    if (object) {
      resetStalkerState(object);

      object.set_npc_position(position);
    } else {
      squadMember.object.position = position;
    }
  }
}
