import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";

// todo: Create factory here.

export function bindAnomalyField(object: XR_game_object): void {
  object.bind_object(create_xr_class_instance(AnomalyFieldBinder, object));
}

export function bindAnomalyZone(object: XR_game_object): void {
  object.bind_object(create_xr_class_instance(AnomalyZoneBinder, object));
}
