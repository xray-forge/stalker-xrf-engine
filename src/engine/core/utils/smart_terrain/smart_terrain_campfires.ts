import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isEmpty } from "@/engine/core/utils/table";
import { Optional, TNumberId, ZoneCampfire } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Turn on smart terrain camp fires.
 *
 * @param smartTerrain - terrain to turn on linked campfires
 */
export function turnOnSmartTerrainCampfires(smartTerrain: SmartTerrain): void {
  // logger.info("Turn on campfires for:", smartTerrain.name());

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
    smartTerrain.name()
  );

  if (!isEmpty(smartTerrainCampfires)) {
    for (const [, campfire] of smartTerrainCampfires) {
      if (!campfire.is_on()) {
        campfire.turn_on();
      }
    }
  }

  smartTerrain.areCampfiresOn = true;
}

/**
 * Turn off smart terrain camp fires.
 *
 * @param smartTerrain - terrain to turn off linked campfires
 */
export function turnOffSmartTerrainCampfires(smartTerrain: SmartTerrain): void {
  // logger.info("Turn off campfires for:", smartTerrain.name());

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
    smartTerrain.name()
  );

  if (!isEmpty(smartTerrainCampfires)) {
    for (const [, campfire] of smartTerrainCampfires) {
      if (campfire.is_on()) {
        campfire.turn_off();
      }
    }
  }

  smartTerrain.areCampfiresOn = false;
}
