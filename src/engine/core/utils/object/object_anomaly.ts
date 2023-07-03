import { alife } from "xray16";

import { registry } from "@/engine/core/database";
import { AnomalyZoneBinder } from "@/engine/core/objects";
import { ClientObject, LuaArray, Optional, ServerObject, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function anomalyHasArtefact(
  actor: ClientObject,
  object: Optional<ClientObject>,
  anomalyZoneName: TName,
  artefactName: Optional<TName>
): LuaMultiReturn<[boolean, Optional<LuaArray<TName>>]> {
  const anomalyZone: AnomalyZoneBinder = registry.anomalyZones.get(anomalyZoneName);

  if (anomalyZone === null) {
    return $multi(false, null);
  }

  if (anomalyZone.spawnedArtefactsCount < 1) {
    return $multi(false, null);
  }

  if (artefactName === null) {
    const artefactsList: LuaArray<TName> = new LuaTable();

    for (const [k, v] of registry.artefacts.ways) {
      const artefactObject: Optional<ServerObject> = alife().object(tonumber(k)!);

      if (artefactObject) {
        table.insert(artefactsList, artefactObject.section_name());
      }
    }

    return $multi(true, artefactsList);
  }

  for (const [artefactId] of registry.artefacts.ways) {
    if (
      alife().object(tonumber(artefactId)!) &&
      artefactName === alife().object(tonumber(artefactId)!)!.section_name()
    ) {
      return $multi(true, null);
    }
  }

  return $multi(false, null);
}
