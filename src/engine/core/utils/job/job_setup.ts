import { alife } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { LuaLogger } from "@/engine/core/utils/logging";
import { initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { AlifeSimulator, ClientObject, ESchemeType, Optional, ServerCreatureObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 *
 * @param object - target client object to setup logic
 * @param state - target object registry state
 * @param schemeType - target object active scheme type
 * @param isLoaded - whether object is initialized after game load
 */
export function setupObjectSmartJobsAndLogicOnSpawn(
  object: ClientObject,
  state: IRegistryObjectState,
  schemeType: ESchemeType,
  isLoaded: boolean
): void {
  logger.info("Setup smart terrain logic on spawn:", object.name(), schemeType);

  const alifeSimulator: Optional<AlifeSimulator> = alife();
  const serverObject: Optional<ServerCreatureObject> = alife()!.object(object.id());

  if (
    alifeSimulator === null ||
    serverObject === null ||
    serverObject.m_smart_terrain_id === null ||
    serverObject.m_smart_terrain_id === MAX_U16
  ) {
    return initializeObjectSchemeLogic(object, state, isLoaded, schemeType);
  }

  const smartTerrain: SmartTerrain = alifeSimulator.object(serverObject.m_smart_terrain_id) as SmartTerrain;
  const needSetupLogic: boolean =
    !isLoaded &&
    smartTerrain.objectJobDescriptors.get(object.id()) &&
    smartTerrain.objectJobDescriptors.get(object.id()).begin_job === true;

  if (needSetupLogic) {
    smartTerrain.setupObjectLogic(object);
  } else {
    initializeObjectSchemeLogic(object, state, isLoaded, schemeType);
  }
}
