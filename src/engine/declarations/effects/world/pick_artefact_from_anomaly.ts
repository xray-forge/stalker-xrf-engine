import { GameObject, ServerArtefactItemObject, ServerHumanObject } from "xray16/alias";
import { abort, extern, Nillable, TName, TNumberId, TSection, TStringId } from "xray16/lib";
import { $isNil } from "xray16/macros";

import type { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";

import { logger } from "./shared";

// todo: Rework, looks bad
extern(
  "xr_effects.pick_artefact_from_anomaly",
  (
    _: GameObject,
    object: Nillable<GameObject | ServerHumanObject>,
    params: [Nillable<TStringId>, Nillable<TName>, TName]
  ): void => {
    logger.info("Pick artefact from anomaly");

    const anomalyZoneName: Nillable<TName> = params && params[1];
    let artefactSection: TSection = params && params[2];

    const anomalyZone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(anomalyZoneName as TName);

    if (params && params[0]) {
      const objectId: Nillable<TNumberId> = getObjectIdByStoryId(params[0]);

      if ($isNil(objectId)) {
        abort("Couldn't relocate item to NULL in function 'pick_artefact_from_anomaly!'");
      }

      object = registry.simulator.object(objectId) as ServerHumanObject;

      if (object && (!isStalker(object) || !object.alive())) {
        abort("Couldn't relocate item to NULL (dead || ! stalker) in function 'pick_artefact_from_anomaly!'");
      }
    }

    if ($isNil(anomalyZone)) {
      abort("No such anomal zone in function 'pick_artefact_from_anomaly!'");
    }

    if (anomalyZone.spawnedArtefactsCount < 1) {
      return;
    }

    let artefactObject: Nillable<ServerArtefactItemObject> = null;

    for (const [artefactId] of anomalyZone.artefactPathsByArtefactId) {
      if (
        registry.simulator.object(artefactId) &&
        artefactSection === registry.simulator.object(artefactId)!.section_name()
      ) {
        artefactObject = registry.simulator.object(artefactId);
        break;
      }

      if ($isNil(artefactSection)) {
        artefactObject = registry.simulator.object(artefactId);
        artefactSection = artefactObject!.section_name();
        break;
      }
    }

    if (!artefactObject) {
      return;
    }

    anomalyZone.onArtefactTaken(artefactObject.id);
    registry.simulator.release(artefactObject!, true);
    spawnItemsForObject(object as GameObject, artefactSection);
  }
);
