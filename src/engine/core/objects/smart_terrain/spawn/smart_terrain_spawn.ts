import { game } from "xray16";

import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { Squad } from "@/engine/core/objects/squad";
import { abort } from "@/engine/core/utils/assertion";
import { parseConditionsList, parseStringsList, pickSectionFromCondList, readIniString } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TCount, Time, TSection, TStringId } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function applySmartTerrainRespawnSection(smartTerrain: SmartTerrain, respawnSection: TSection): void {
  smartTerrain.isRespawnPoint = true;
  smartTerrain.respawnConfiguration = new LuaTable();
  smartTerrain.alreadySpawned = new LuaTable();

  if (!smartTerrain.ini.section_exist(respawnSection)) {
    abort("Wrong smart_terrain respawn_params section [%s] (there is no section).", respawnSection);
  }

  const parametersCount: TCount = smartTerrain.ini.line_count(respawnSection);

  if (parametersCount === 0) {
    abort("Wrong smart_terrain respawn_params section [%s](empty params)", respawnSection);
  }

  for (const it of $range(0, parametersCount - 1)) {
    const [, sectionName] = smartTerrain.ini.r_line(respawnSection, it, "", "");

    if (!smartTerrain.ini.section_exist(sectionName)) {
      abort(
        "Wrong smart_terrain respawn_params section [%s] prop [%s](there is no section).",
        respawnSection,
        sectionName
      );
    }

    const squadsCount: Optional<string> = readIniString(smartTerrain.ini, sectionName, "spawn_num", false);
    const squadsToSpawn: Optional<string> = readIniString(smartTerrain.ini, sectionName, "spawn_squads", false);

    if (squadsToSpawn === null) {
      abort(
        "Wrong smart_terrain respawn_params section [%s] prop [%s] line [spawn_squads](there is no line)",
        respawnSection,
        sectionName
      );
    } else if (squadsCount === null) {
      abort(
        "Wrong smart_terrain respawn_params section [%s] prop [%s] line [spawn_num](there is no line)",
        respawnSection,
        sectionName
      );
    }

    smartTerrain.alreadySpawned.set(sectionName, { num: 0 });
    smartTerrain.respawnConfiguration.set(sectionName, {
      num: parseConditionsList(squadsCount),
      squads: parseStringsList(squadsToSpawn),
    });
  }
}

/**
 * todo: Description.
 * todo: throttle globally to delay spawn 10+ at once
 */
export function respawnSmartTerrainSquad(smartTerrain: SmartTerrain): void {
  // logger.info("Respawn squad in smart:", this.name());

  const availableSections: LuaArray<TSection> = new LuaTable();

  // Pick section that can be used for spawn and have available spots.
  for (const [section, descriptor] of smartTerrain.respawnConfiguration) {
    if (
      tonumber(pickSectionFromCondList(registry.actor, null, descriptor.num))! >
      smartTerrain.alreadySpawned.get(section).num
    ) {
      table.insert(availableSections, section);
    }
  }

  if (availableSections.length() > 0) {
    const sectionToSpawn: TSection = availableSections.get(math.random(1, availableSections.length()));
    const sectionParams = smartTerrain.respawnConfiguration.get(sectionToSpawn);
    const squadId: TStringId = sectionParams.squads.get(math.random(1, sectionParams.squads.length()));
    const squad: Squad = smartTerrain.simulationBoardManager.createSquad(smartTerrain, squadId);

    squad.respawnPointId = smartTerrain.id;
    squad.respawnPointSection = sectionToSpawn;

    smartTerrain.simulationBoardManager.enterSmartTerrain(squad, smartTerrain.id);

    for (const squadMember of squad.squad_members()) {
      smartTerrain.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
    }

    smartTerrain.alreadySpawned.get(sectionToSpawn).num += 1;
  }
}

/**
 * todo: Description.
 */
export function tryRespawnSmartTerrainSquad(smartTerrain: SmartTerrain): void {
  const currentTime: Time = game.get_game_time();

  if (
    smartTerrain.lastRespawnUpdatedAt === null ||
    currentTime.diffSec(smartTerrain.lastRespawnUpdatedAt) > smartTerrainConfig.RESPAWN_IDLE
  ) {
    smartTerrain.lastRespawnUpdatedAt = currentTime;

    if (
      pickSectionFromCondList(registry.actor, smartTerrain, smartTerrain.isSimulationAvailableConditionList) !== TRUE
    ) {
      return;
    }

    const squadsCount: TCount = smartTerrain.simulationBoardManager.getSmartTerrainAssignedSquads(smartTerrain.id);

    if (smartTerrain.maxPopulation <= squadsCount) {
      return;
    }

    if (
      registry.actorServer.position.distance_to_sqr(smartTerrain.position) <
      smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR
    ) {
      return;
    }

    respawnSmartTerrainSquad(smartTerrain);
  }
}
