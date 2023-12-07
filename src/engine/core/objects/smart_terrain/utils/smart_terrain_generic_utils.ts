import { game } from "xray16";

import { registry } from "@/engine/core/database";
import { ISmartTerrainDescriptor, SimulationManager } from "@/engine/core/managers/simulation";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isEmpty } from "@/engine/core/utils/table";
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
    const smartTerrainDescriptor: ISmartTerrainDescriptor = SimulationManager.getInstance().getSmartTerrainDescriptor(
      smartTerrain.id
    )!;

    let caption: TLabel = string.format(
      "[%s] (%s) (%s)\\navailable = %s\\nonline = %s\\nsimulation_role = %s\\nsquad_id = %s\\ncapacity = %s\\%s\\n",
      game.translate_string(getSmartTerrainNameCaption(smartTerrain)),
      smartTerrain.name(),
      smartTerrain.id,
      smartTerrain.isSimulationAvailable(),
      smartTerrain.online,
      smartTerrain.simulationRole,
      smartTerrain.squadId,
      smartTerrainDescriptor.assignedSquadsCount,
      smartTerrain.maxStayingSquadsCount
    );

    caption += string.format(
      "arriving_objects = %s\\nstaying_objects = %s\\n",
      table.size(smartTerrain.arrivingObjects),
      smartTerrain.stayingObjectsCount
    );

    if (smartTerrain.isRespawnPoint) {
      caption += string.format(
        "[spawn_state] (tts: %s)\\n",
        smartTerrain.lastRespawnUpdatedAt
          ? smartTerrainConfig.RESPAWN_IDLE - game.get_game_time().diffSec(smartTerrain.lastRespawnUpdatedAt)
          : "?"
      );

      for (const [section, descriptor] of smartTerrain.spawnedSquadsList) {
        caption += string.format(
          "%s -> %s\\%s\\n",
          section,
          descriptor.num,
          pickSectionFromCondList(registry.actor, null, smartTerrain.spawnSquadsConfiguration.get(section).num)
        );
      }
    } else {
      caption += "[not respawn point]\\n";
    }

    if (!isEmpty(smartTerrainDescriptor.assignedSquads)) {
      caption += "[assigned]\\n";

      for (const [, squad] of smartTerrainDescriptor.assignedSquads) {
        caption += `${tostring(squad.name())} -> ${squad.getScriptedSimulationTarget()}\\n`;
      }
    }

    if (!isEmpty(smartTerrain.simulationProperties)) {
      caption += "[properties]\\n";

      for (const [name, value] of smartTerrain.simulationProperties) {
        caption += `${name} -> ${value}\\n`;
      }
    }

    caption += string.format(
      "[jobs]\\ntotal = %s\\nworking = %s\\n",
      smartTerrain.jobs.length(),
      table.size(smartTerrain.objectJobDescriptors)
    );

    if (!isEmpty(smartTerrain.objectByJobSection)) {
      caption += "[workers]\\n";

      for (const [name, id] of smartTerrain.objectByJobSection) {
        caption += `${name} -> ${id}\\n`;
      }
    }

    return caption;
  } else {
    return getSmartTerrainNameCaption(smartTerrain);
  }
}
