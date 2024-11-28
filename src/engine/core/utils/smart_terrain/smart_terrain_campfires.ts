import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { isEmpty } from "@/engine/core/utils/table";
import { Optional, TNumberId, ZoneCampfire } from "@/engine/lib/types";

/**
 * Turn on smart terrain camp fires.
 *
 * @param terrain - terrain to turn on linked campfires
 */
export function turnOnTerrainCampfires(terrain: SmartTerrain): void {
  // logger.format("Turn on campfires for: %s", terrain.name());

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
    terrain.name()
  );

  if (!isEmpty(smartTerrainCampfires)) {
    for (const [, campfire] of smartTerrainCampfires) {
      if (!campfire.is_on()) {
        campfire.turn_on();
      }
    }
  }

  terrain.areCampfiresOn = true;
}

/**
 * Turn off smart terrain camp fires.
 *
 * @param terrain - terrain to turn off linked campfires
 */
export function turnOffSmartTerrainCampfires(terrain: SmartTerrain): void {
  // logger.format("Turn off campfires for: %s", terrain.name());

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
    terrain.name()
  );

  if (!isEmpty(smartTerrainCampfires)) {
    for (const [, campfire] of smartTerrainCampfires) {
      if (campfire.is_on()) {
        campfire.turn_off();
      }
    }
  }

  terrain.areCampfiresOn = false;
}
