import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check whether object was hit in bone with on of provided string identifiers.
 *
 * Where:
 * - parameters - variadic list of bone IDs to match against.
 */
extern("xr_conditions.hitted_on_bone", (_: GameObject, object: GameObject, parameters: Array<TStringId>): boolean => {
  const state: Nillable<ISchemeHitState> = getSchemeState(registry.objects.get(object.id()), EScheme.HIT);

  if (!state) {
    return false;
  }

  for (const [, boneId] of ipairs(parameters)) {
    if (object.get_bone_id(boneId) === state.boneIndex) {
      return true;
    }
  }

  return false;
});
