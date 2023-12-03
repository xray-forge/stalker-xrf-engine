import { patrol } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { abort } from "@/engine/core/utils/assertion";
import {
  parseConditionsList,
  parseStringsList,
  pickSectionFromCondList,
  readIniString,
  readIniTwoNumbers,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { LuaArray, Optional, Patrol, TCount, TIndex, TName, TNumberId, TSection, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export function createSquadMembers(squad: Squad, spawnSmartTerrain: SmartTerrain): void {
  logger.info("Create squad members:", squad.name(), spawnSmartTerrain?.name());

  const section: TSection = squad.section_name();

  const spawnSections: LuaArray<TSection> = parseStringsList(
    readIniString(SYSTEM_INI, section, "npc", false, null, "")
  );
  const spawnPointData =
    readIniString(SYSTEM_INI, section, "spawn_point", false, null, "self") ||
    readIniString(spawnSmartTerrain.ini, SMART_TERRAIN_SECTION, "spawn_point", false, null, "self");

  const spawnPoint: Optional<TName> = pickSectionFromCondList(
    registry.actor,
    squad,
    parseConditionsList(spawnPointData)
  );

  let baseSpawnPosition: Vector = spawnSmartTerrain.position;
  let baseLevelVertexId: TNumberId = spawnSmartTerrain.m_level_vertex_id;
  let baseGameVertexId: TNumberId = spawnSmartTerrain.m_game_vertex_id;

  if (spawnPoint) {
    if (spawnPoint === "self") {
      baseSpawnPosition = spawnSmartTerrain.position;
      baseLevelVertexId = spawnSmartTerrain.m_level_vertex_id;
      baseGameVertexId = spawnSmartTerrain.m_game_vertex_id;
    } else {
      const destination: Patrol = new patrol(spawnPoint);

      baseSpawnPosition = destination.point(0);
      baseLevelVertexId = destination.level_vertex_id(0);
      baseGameVertexId = destination.game_vertex_id(0);
    }
  } else if (spawnSmartTerrain.spawnPointName) {
    const destination: Patrol = new patrol(spawnSmartTerrain.spawnPointName);

    baseSpawnPosition = destination.point(0);
    baseLevelVertexId = destination.level_vertex_id(0);
    baseGameVertexId = destination.game_vertex_id(0);
  }

  if (spawnSections.length() !== 0) {
    for (const [, squadMemberSection] of spawnSections) {
      squad.addMember(squadMemberSection, baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
    }
  }

  const randomSpawnConfig: Optional<string> = readIniString(SYSTEM_INI, section, "npc_random", false);

  if (randomSpawnConfig) {
    const randomSpawn: LuaArray<string> = parseStringsList(randomSpawnConfig)!;

    const [countMin, countMax] = readIniTwoNumbers(SYSTEM_INI, section, "npc_in_squad", 1, 2);

    if (countMin > countMax) {
      abort("min_count can't be greater then max_count [%s]!", section);
    }

    const randomCount: TCount = math.random(countMin, countMax);

    for (const _ of $range(1, randomCount)) {
      const randomId: TIndex = math.random(1, randomSpawn!.length());

      squad.addMember(randomSpawn!.get(randomId), baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
    }
  } else if (spawnSections.length() === 0) {
    abort("You are trying to spawn an empty squad [%s]!", section);
  }

  squad.assignedSmartTerrainId = spawnSmartTerrain.id;
  squad.mapDisplayManager.updateSquadMapSpot(squad);
}
