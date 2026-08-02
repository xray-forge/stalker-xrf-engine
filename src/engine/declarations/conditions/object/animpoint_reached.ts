import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check if animpoint scheme position is reached.
 */
extern("xr_conditions.animpoint_reached", (_: GameObject, object: GameObject): boolean => {
  const animpointState: Nillable<ISchemeAnimpointState> = registry.objects.get(object.id())[
    EScheme.ANIMPOINT
  ] as Nillable<ISchemeAnimpointState>;

  if (animpointState) {
    return animpointState.animpointController.isPositionReached();
  } else {
    return false;
  }
});
