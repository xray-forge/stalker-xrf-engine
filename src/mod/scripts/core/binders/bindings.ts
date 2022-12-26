import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";

export function bindAnomalyField(object: XR_game_object): void {
  object.bind_object(create_xr_class_instance(AnomalyFieldBinder, object));
}
