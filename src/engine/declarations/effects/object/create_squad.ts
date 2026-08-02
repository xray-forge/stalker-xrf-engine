import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TSection } from "xray16/lib";

import { spawnSquadInSmart } from "@/engine/core/utils/spawn";

/**
 * Spawn a squad of the provided section in the named smart terrain.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param params - Tuple of squad section and target smart terrain name.
 */
extern(
  "xr_effects.create_squad",
  (_: GameObject, __: Nillable<GameObject>, [section, terrainName]: [TSection, TName]): void => {
    spawnSquadInSmart(section, terrainName);
  }
);
