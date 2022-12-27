import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { ArtefactBinder } from "@/mod/scripts/core/binders/ArtefactBinder";

function createBinder(target: XR_object_binder): (object: XR_game_object) => void {
  return (object: XR_game_object) => object.bind_object(create_xr_class_instance(target, object));
}

export const bindAnomalyField = createBinder(AnomalyFieldBinder);
export const bindAnomalyZone = createBinder(AnomalyZoneBinder);
export const bindArtefact = createBinder(ArtefactBinder);
