import { XR_game_object, XR_object_binder } from "xray16";

import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { ArtefactBinder } from "@/mod/scripts/core/binders/ArtefactBinder";
import { CampBinder } from "@/mod/scripts/core/binders/CampBinder";
import { CrowBinder } from "@/mod/scripts/core/binders/CrowBinder";

function createBinder(target: XR_object_binder): (object: XR_game_object) => void {
  return (object: XR_game_object) => object.bind_object(create_xr_class_instance(target, object));
}

// @ts-ignore, declare lua global
list = {
  bindAnomalyField: createBinder(AnomalyFieldBinder),
  bindAnomalyZone: createBinder(AnomalyZoneBinder),
  bindArtefact: createBinder(ArtefactBinder),
  bindCrow: createBinder(CrowBinder),
  bindCamp: createBinder(CampBinder)
};
