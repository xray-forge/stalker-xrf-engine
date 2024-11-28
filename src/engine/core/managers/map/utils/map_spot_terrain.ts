import { game, level } from "xray16";

import { getManagerByName, getObjectIdByStoryId, registry } from "@/engine/core/database";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { getSmartTerrainNameCaption } from "@/engine/core/objects/smart_terrain/utils/smart_terrain_generic_utils";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { ERelation } from "@/engine/core/utils/relation";
import { isEmpty } from "@/engine/core/utils/table";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { TRUE } from "@/engine/lib/constants/words";
import { Optional, TLabel, TName, TNumberId } from "@/engine/lib/types";

/**
 * Update display of global terrain spots.
 * Show all points that are not displayed yet, validate if node discovery is needed.
 */
export function updateTerrainsMapSpotDisplay(): void {
  for (const [, descriptor] of mapDisplayConfig.MAP_SPOTS) {
    if (
      !descriptor.isVisible &&
      (!mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT || hasInfoPortion(string.format("%s_visited", descriptor.target)))
    ) {
      const objectId: Optional<TNumberId> = getObjectIdByStoryId(descriptor.target);

      if (objectId) {
        descriptor.isVisible = true;
        level.map_add_object_spot(objectId, "primary_object", descriptor.hint);
      }
    }
  }
}

/**
 * @param terrain - target smart terrain to update map spot for
 */
export function updateTerrainMapSpot(terrain: SmartTerrain): void {
  if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
    updateTerrainDebugMapSpot(terrain);
  } else if (terrain.mapSpot) {
    removeTerrainMapSpot(terrain);
    terrain.mapSpot = null;
  }
}

/**
 * @param terrain - target smart terrain to update map spot for in debug mode
 */
export function updateTerrainDebugMapSpot(terrain: SmartTerrain): void {
  const previousSpot: TName = string.format("alife_presentation_smart_%s_%s", terrain.simulationRole, terrain.mapSpot);
  const spot: ERelation =
    pickSectionFromCondList(registry.actor, terrain, terrain.isSimulationAvailableConditionList) === TRUE
      ? ERelation.FRIEND
      : ERelation.ENEMY;

  if (terrain.mapSpot === spot) {
    return level.map_change_spot_hint(terrain.id, previousSpot, getTerrainMapSpotHint(terrain));
  }

  // If previous mark is defined, remove it.
  if (terrain.mapSpot) {
    level.map_remove_object_spot(terrain.id, previousSpot);
  }

  terrain.mapSpot = spot;

  level.map_add_object_spot(
    terrain.id,
    string.format("alife_presentation_smart_%s_%s", terrain.simulationRole, spot),
    getTerrainMapSpotHint(terrain)
  );
}

/**
 * @param terrain - smart terrain to remove map display spot for
 */
export function removeTerrainMapSpot(terrain: SmartTerrain): void {
  if (terrain.mapSpot) {
    level.map_remove_object_spot(terrain.id, `alife_presentation_smart_${terrain.simulationRole}_${terrain.mapSpot}`);
  }
}

/**
 * @param terrain - target smart terrain to get hint for
 * @returns label displayed on hover when using in-game map
 */
export function getTerrainMapSpotHint(terrain: SmartTerrain): TLabel {
  if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
    const terrainDescriptor: ISmartTerrainDescriptor = (
      getManagerByName<SimulationManager>("SimulationManager") as SimulationManager
    ).getTerrainDescriptorById(terrain.id)!;

    let caption: TLabel = string.format(
      "[%s] (%s) (%s)\\navailable = %s\\nonline = %s\\nsimulation_role = %s\\nsquad_id = %s\\ncapacity = %s\\%s\\n",
      game.translate_string(getSmartTerrainNameCaption(terrain)),
      terrain.name(),
      terrain.id,
      terrain.isSimulationAvailable(),
      terrain.online,
      terrain.simulationRole,
      terrain.squadId,
      terrainDescriptor.assignedSquadsCount,
      terrain.maxStayingSquadsCount
    );

    caption += string.format(
      "arriving_objects = %s\\nstaying_objects = %s\\n",
      table.size(terrain.arrivingObjects),
      terrain.stayingObjectsCount
    );

    if (terrain.isRespawnPoint) {
      caption += string.format(
        "[spawn_state] (tts: %s)\\n",
        terrain.lastRespawnUpdatedAt
          ? smartTerrainConfig.RESPAWN_IDLE - game.get_game_time().diffSec(terrain.lastRespawnUpdatedAt)
          : "?"
      );

      for (const [section, descriptor] of terrain.spawnedSquadsList) {
        caption += string.format(
          "%s -> %s\\%s\\n",
          section,
          descriptor.num,
          pickSectionFromCondList(registry.actor, null, terrain.spawnSquadsConfiguration.get(section).num)
        );
      }
    } else {
      caption += "[not respawn point]\\n";
    }

    if (!isEmpty(terrainDescriptor.assignedSquads)) {
      caption += "[assigned]\\n";

      for (const [, squad] of terrainDescriptor.assignedSquads) {
        caption += `${tostring(squad.name())} -> ${squad.getScriptedSimulationTarget()}\\n`;
      }
    }

    if (!isEmpty(terrain.simulationProperties)) {
      caption += "[properties]\\n";

      for (const [name, value] of terrain.simulationProperties) {
        caption += `${name} -> ${value}\\n`;
      }
    }

    caption += string.format(
      "[jobs]\\ntotal = %s\\nworking = %s\\n",
      terrain.jobs.length(),
      table.size(terrain.objectJobDescriptors)
    );

    if (!isEmpty(terrain.objectByJobSection)) {
      caption += "[workers]\\n";

      for (const [name, id] of terrain.objectByJobSection) {
        caption += `${name} -> ${id}\\n`;
      }
    }

    return caption;
  } else {
    return getSmartTerrainNameCaption(terrain);
  }
}
