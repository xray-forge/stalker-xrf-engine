import { level } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $filename } from "xray16/macros";

import { registry, resetStalkerState } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorToString } from "@/engine/core/utils/vector";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Set squad position in current level by supplied vector.
 * Works within one level limits.
 *
 * @param squad - Target squad to change position.
 * @param position - New squad position.
 */
export function setSquadPosition(squad: Squad, position: Vector): void {
  logger.info("Set squad position: '%s', '%s', '%s'", squad.name(), squad.online, vectorToString(position));

  if (!squad.online) {
    squad.force_change_position(position);
  }

  for (const squadMember of squad.squad_members()) {
    const object: Nillable<GameObject> = registry.objects.get(squadMember.id)?.object as Nillable<GameObject>;

    registry.offlineObjects.get(squadMember.id).levelVertexId = level.vertex_id(position);

    if (object) {
      resetStalkerState(object);

      object.set_npc_position(position);
    } else {
      squadMember.object.position = position;
    }
  }
}
