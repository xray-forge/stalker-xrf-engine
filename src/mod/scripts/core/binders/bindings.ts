import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { ArtefactBinder } from "@/mod/scripts/core/binders/ArtefactBinder";
import { CampBinder } from "@/mod/scripts/core/binders/CampBinder";
import { CrowBinder } from "@/mod/scripts/core/binders/CrowBinder";

export type TBinder = (object: XR_game_object) => void;

function createBinder(target: XR_object_binder): TBinder {
  return (object: XR_game_object) => object.bind_object(create_xr_class_instance(target, object));
}

export const bindAnomalyField: TBinder = createBinder(AnomalyFieldBinder);
export const bindAnomalyZone: TBinder = createBinder(AnomalyZoneBinder);
export const bindArtefact: TBinder = createBinder(ArtefactBinder);
export const bindCrow: TBinder = createBinder(CrowBinder);
export const bindCamp: TBinder = createBinder(CampBinder);
