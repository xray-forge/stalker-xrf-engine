import { game } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { ISmartTerrainSpawnConfiguration } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { Squad } from "@/engine/core/objects/squad";
import { abort } from "@/engine/core/utils/assertion";
import { parseConditionsList, parseStringsList, pickSectionFromCondList, readIniString } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TCount, Time, TSection } from "@/engine/lib/types";

/**
 * Apply respawn configuration for provided smart terrain.
 * Based on provided section tries to read list of squad sections to get exact targets and count to spawn.
 *
 * @param smartTerrain - target smart terrain to set configuration for
 * @param section - section in smart terrain ini configuration file to read spawn information from
 */
export function applySmartTerrainRespawnSectionsConfig(smartTerrain: SmartTerrain, section: TSection): void {
  smartTerrain.isRespawnPoint = true;
  smartTerrain.spawnSquadsConfiguration = new LuaTable();
  smartTerrain.spawnedSquadsList = new LuaTable();

  if (!smartTerrain.ini.section_exist(section)) {
    abort("Could not find respawn configuration section '%s' for '%s'.", section, smartTerrain.name());
  }

  const parametersCount: TCount = smartTerrain.ini.line_count(section);

  if (parametersCount === 0) {
    abort("Wrong smart terrain respawn configuration section '%s' - empty for '%s'.", section, smartTerrain.name());
  }

  for (const it of $range(0, parametersCount - 1)) {
    const [, sectionName] = smartTerrain.ini.r_line(section, it, "", "");

    // Validate respawn section line.
    if (!smartTerrain.ini.section_exist(sectionName)) {
      abort(
        "Wrong smart terrain respawn configuration section '%s' line '%s' - there is no such section.",
        section,
        sectionName
      );
    }

    const squadsCount: Optional<string> = readIniString(smartTerrain.ini, sectionName, "spawn_num", false);
    const squadsToSpawn: Optional<string> = readIniString(smartTerrain.ini, sectionName, "spawn_squads", false);

    // Validate each line to be defined.
    if (squadsToSpawn === null) {
      abort(
        "Wrong smart terrain respawn configuration section '%s' line 'spawn_squads' in '%s' is not defined.",
        section,
        sectionName
      );
    } else if (squadsCount === null) {
      abort(
        "Wrong smart terrain respawn configuration section '%s' line 'spawn_num' in '%s' is not defined.",
        section,
        sectionName
      );
    }

    smartTerrain.spawnedSquadsList.set(sectionName, { num: 0 });
    smartTerrain.spawnSquadsConfiguration.set(sectionName, {
      num: parseConditionsList(squadsCount),
      squads: parseStringsList(squadsToSpawn),
    });
  }
}

/**
 * Respawn random squad section from smart terrain spawn config.
 * Finds random one available to spawn and assigns it to the terrain.
 *
 * @param smartTerrain - target smart terrain to spawn squad in
 * @returns spawned squad or null if cannot spawn any
 */
export function respawnSmartTerrainSquad(smartTerrain: SmartTerrain): Optional<Squad> {
  // logger.info("Respawn squad in smart:", this.name());

  const availableSections: LuaArray<TSection> = new LuaTable();

  // Pick section that can be used for spawn and have available spots.
  for (const [section, descriptor] of smartTerrain.spawnSquadsConfiguration) {
    if (
      tonumber(pickSectionFromCondList(registry.actor, null, descriptor.num))! >
      smartTerrain.spawnedSquadsList.get(section).num
    ) {
      table.insert(availableSections, section);
    }
  }

  // No available spawn spots.
  if (availableSections.length() === 0) {
    return null;
  }

  const simulationManager: SimulationManager = smartTerrain.simulationManager;
  const spawnSection: TSection = table.random(availableSections)[1];
  const squadSection: TSection = table.random(smartTerrain.spawnSquadsConfiguration.get(spawnSection).squads)[1];

  const squad: Squad = simulationManager.createSquad(smartTerrain, squadSection);

  squad.respawnPointId = smartTerrain.id;
  squad.respawnPointSection = spawnSection;

  simulationManager.assignSquadToSmartTerrain(squad, smartTerrain.id);

  // Is it duplicated with create squad method? Should we do it twice?
  for (const squadMember of squad.squad_members()) {
    simulationManager.setupObjectSquadAndGroup(squadMember.object);
  }

  smartTerrain.spawnedSquadsList.get(spawnSection).num += 1;

  return squad;
}

/**
 * @param smartTerrain - target smart terrain to check spawn availability for
 * @returns whether smart terrain squad spawn operation can be performed
 */
export function canRespawnSmartTerrainSquad(smartTerrain: SmartTerrain): boolean {
  const now: Time = game.get_game_time();

  // Throttle respawn attempts period.
  // Memoize `false` state for `idle` period of time.
  if (
    smartTerrain.lastRespawnUpdatedAt !== null &&
    now.diffSec(smartTerrain.lastRespawnUpdatedAt) <= smartTerrainConfig.RESPAWN_IDLE
  ) {
    return false;
  } else {
    smartTerrain.lastRespawnUpdatedAt = now;
  }

  return (
    pickSectionFromCondList(registry.actor, smartTerrain, smartTerrain.isSimulationAvailableConditionList) === TRUE &&
    smartTerrain.simulationManager.getSmartTerrainAssignedSquadsCount(smartTerrain.id) <
      smartTerrain.maxStayingSquadsCount &&
    registry.actorServer.position.distance_to_sqr(smartTerrain.position) >
      smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR
  );
}
