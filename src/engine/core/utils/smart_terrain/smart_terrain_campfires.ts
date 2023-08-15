/**
 * todo;
 */
import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isEmpty } from "@/engine/core/utils/table";
import { Optional, TNumberId, ZoneCampfire } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function turnOnSmartTerrainCampfires(smartTerrain: SmartTerrain): void {
  logger.info("Turn on campfires for:", smartTerrain.name());

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
    smartTerrain.name()
  );

  if (smartTerrainCampfires !== null && !isEmpty(smartTerrainCampfires)) {
    for (const [id, campfire] of smartTerrainCampfires) {
      if (!campfire.is_on()) {
        campfire.turn_on();
      }
    }
  }

  smartTerrain.areCampfiresOn = true;
}

/**
 * todo;
 */
export function turnOffSmartTerrainCampfires(smartTerrain: SmartTerrain): void {
  logger.info("Turn off campfires for:", smartTerrain.name());

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
    smartTerrain.name()
  );

  if (smartTerrainCampfires !== null && !isEmpty(smartTerrainCampfires)) {
    for (const [id, campfire] of smartTerrainCampfires) {
      if (campfire.is_on()) {
        campfire.turn_off();
      }
    }
  }

  smartTerrain.areCampfiresOn = false;
}
