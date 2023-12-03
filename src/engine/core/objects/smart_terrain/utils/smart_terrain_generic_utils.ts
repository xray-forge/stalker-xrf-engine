import { game } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { toJSON } from "@/engine/core/utils/transform";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { TLabel } from "@/engine/lib/types";

/**
 * Get smart terrain name label.
 * Used for UI display or mentioning in strings.
 *
 * @returns translated name label
 */
export function getSmartTerrainNameCaption(smartTerrain: SmartTerrain): TLabel {
  return string.format("st_%s_name", smartTerrain.name());
}

/**
 * @param smartTerrain - target smart terrain to get hint for
 * @returns label displayed on hover when using in-game map
 */
export function getSmartTerrainMapDisplayHint(smartTerrain: SmartTerrain): TLabel {
  if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
    let caption: TLabel = string.format(
      "%s (%s)\\nonline = %s\\nsimulation_role = %s\\nsquad_id = %s\\ncapacity = %s\\%s\\n",
      game.translate_string(getSmartTerrainNameCaption(smartTerrain)),
      smartTerrain.name(),
      smartTerrain.online,
      smartTerrain.simulationRole,
      smartTerrain.squadId,
      SimulationBoardManager.getInstance().getSmartTerrainPopulation(smartTerrain.id),
      smartTerrain.maxPopulation
    );

    if (smartTerrain.isRespawnPoint) {
      caption += "\\nalready_spawned:\\n";

      for (const [section, descriptor] of smartTerrain.spawnedSquadsList) {
        caption += string.format(
          "[%s] = %s\\%s\\n",
          section,
          descriptor.num,
          pickSectionFromCondList(registry.actor, null, smartTerrain.spawnSquadsConfiguration.get(section).num)
        );
      }

      if (smartTerrain.lastRespawnUpdatedAt) {
        caption += string.format(
          "\ntime_to_spawn: %s\n\n",
          smartTerrainConfig.RESPAWN_IDLE - game.get_game_time().diffSec(smartTerrain.lastRespawnUpdatedAt)
        );
      }
    } else {
      caption += "\\nnot respawn point\\n";
    }

    for (const [id, squad] of SimulationBoardManager.getInstance().getSmartTerrainDescriptor(smartTerrain.id)!
      .assignedSquads) {
      caption += `${tostring(squad.name())}\\n`;
    }

    caption += `\\n${toJSON(smartTerrain.simulationProperties)}`;

    return caption;
  } else {
    return getSmartTerrainNameCaption(smartTerrain);
  }
}
