import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { isEmpty } from "@/engine/core/utils/table";
import { Optional, TNumberId, ZoneCampfire } from "@/engine/lib/types";

/**
 * Turn on smart terrain camp fires.
 *
 * @param smartTerrain - terrain to turn on linked campfires
 */
export function turnOnSmartTerrainCampfires(smartTerrain: SmartTerrain): void {
  // logger.format("Turn on campfires for: %s", smartTerrain.name());

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
  // logger.format("Turn off campfires for: %s", smartTerrain.name());

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
