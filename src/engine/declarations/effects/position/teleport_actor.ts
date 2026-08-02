import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TName } from "xray16/lib";

import { teleportActorToPatrol } from "@/engine/core/utils/position";

/**
 * Teleports actor to provided position and look patrol points.
 */
extern(
  "xr_effects.teleport_actor",
  (_: GameObject, __: GameObject, [positionPatrolName, lookPatrolName]: [Nillable<TName>, Nillable<TName>]): void => {
    assert(positionPatrolName, "Wrong parameters in 'teleport_actor' effect.");

    teleportActorToPatrol(positionPatrolName, lookPatrolName);
  }
);
