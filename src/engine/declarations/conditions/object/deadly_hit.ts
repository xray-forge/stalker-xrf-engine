import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check if deadly hit is set in object hit scheme.
 */
extern("xr_conditions.deadly_hit", (_: GameObject, object: GameObject): boolean => {
  return getSchemeState(registry.objects.get(object.id()), EScheme.HIT)?.isDeadlyHit === true;
});
