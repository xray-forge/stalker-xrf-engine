import { alife, XR_alife_simulator, XR_cse_alife_creature_abstract } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TNumberId } from "@/engine/lib/types";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function onSmartTerrainObjectDeath(object: XR_cse_alife_creature_abstract): void {
  const alifeSimulator: XR_alife_simulator = alife();

  if (alifeSimulator !== null) {
    object = alifeSimulator.object(object.id) as XR_cse_alife_creature_abstract;

    if (object === null) {
      return;
    }

    const smartTerrainId: TNumberId = object.smart_terrain_id();

    if (smartTerrainId !== MAX_U16) {
      logger.info("Clear smart terrain dead object:", object.name());
      (alifeSimulator.object(smartTerrainId) as SmartTerrain).onObjectDeath(object);
    }
  }
}
