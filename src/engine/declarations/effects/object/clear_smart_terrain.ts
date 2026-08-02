import { GameObject } from "xray16/alias";
import { abort, extern, FALSE, Nillable, TName, TStringifiedBoolean } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getStoryIdByObjectId } from "@/engine/core/database";
import {
  getSimulationTerrainByName,
  getSimulationTerrainDescriptorById,
  releaseSimulationSquad,
} from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Release squads assigned to the named smart terrain, Nillablely keeping story-bound squads.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param terrainName - Name of the smart terrain to clear.
 * @param clearStory - When set to false, squads bound to a story ID are preserved.
 */
extern(
  "xr_effects.clear_smart_terrain",
  (
    _: GameObject,
    __: GameObject,
    [terrainName, clearStory]: [Nillable<TName>, Nillable<TStringifiedBoolean>]
  ): void => {
    logger.info("Clear smart terrain: '%s', '%s'", terrainName, clearStory);

    if (!terrainName) {
      abort("Wrong squad id [NIL] in clear_smart_terrain function");
    }

    const terrain: SmartTerrain = getSimulationTerrainByName(terrainName) as SmartTerrain;

    for (const [, squad] of getSimulationTerrainDescriptorById(terrain.id)!.assignedSquads) {
      if (clearStory === FALSE) {
        if (!getStoryIdByObjectId(squad.id)) {
          logger.info("Remove smart terrain squads on effect: '%s', '%s'", terrainName, squad.name());
          releaseSimulationSquad(squad);
        }
      } else {
        logger.info("Remove smart terrain squads on effect: '%s', '%s'", terrainName, squad.name());
        releaseSimulationSquad(squad);
      }
    }
  }
);
