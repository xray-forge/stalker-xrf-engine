import { patrol } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { updateSquadMapSpot } from "@/engine/core/managers/map/utils";
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
import { NIL } from "@/engine/lib/constants/words";
import { LuaArray, Optional, Patrol, TName, TNumberId, TSection, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Spawn default squad members for provided squad / smart terrain.
 * Selects configuration based objects to spawn and assign to the squad.
 *
 * Contains strictly defined objects for the squad and random sections with random count to fill the squad.
 *
 * @param squad - target squad to spawn members for
 * @param spawnSmartTerrain - parent smart terrain assigned to squad
 */
export function createSquadMembers(squad: Squad, spawnSmartTerrain: SmartTerrain): void {
  const squadSection: TSection = squad.section_name();
  const spawnSections: LuaArray<TSection> = parseStringsList(
    readIniString(SYSTEM_INI, squadSection, "npc", false, null, "")
  );
  const spawnPointData: string =
    readIniString(SYSTEM_INI, squadSection, "spawn_point", false) ??
    readIniString(spawnSmartTerrain.ini, SMART_TERRAIN_SECTION, "spawn_point", false) ??
    "self";
  const spawnPoint: Optional<TName> = pickSectionFromCondList(
    registry.actor,
    squad,
    parseConditionsList(spawnPointData)
  );
  const spawnPointName: Optional<TName> =
    spawnPoint && spawnPoint !== NIL ? spawnPoint : (spawnSmartTerrain.spawnPointName as TName);
  const randomSpawnConfig: Optional<string> = readIniString(SYSTEM_INI, squadSection, "npc_random", false);

  if (!randomSpawnConfig && spawnSections.length() === 0) {
    abort("Unexpected attempt to spawn an empty squad '%s'.", squadSection);
  }

  logger.info("Create squad members: %s %s %s %s", squad.name(), spawnSmartTerrain?.name(), spawnPointData, spawnPoint);

  let baseSpawnPosition: Vector;
  let baseLevelVertexId: TNumberId;
  let baseGameVertexId: TNumberId;

  if (spawnPointName && spawnPointName !== "self") {
    const destination: Patrol = new patrol(spawnPointName);

    baseSpawnPosition = destination.point(0);
    baseLevelVertexId = destination.level_vertex_id(0);
    baseGameVertexId = destination.game_vertex_id(0);
  } else {
    baseSpawnPosition = spawnSmartTerrain.position;
    baseLevelVertexId = spawnSmartTerrain.m_level_vertex_id;
    baseGameVertexId = spawnSmartTerrain.m_game_vertex_id;
  }

  for (const [, squadMemberSection] of spawnSections) {
    squad.addMember(squadMemberSection, baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
  }

  if (randomSpawnConfig) {
    const [countMin, countMax] = readIniTwoNumbers(SYSTEM_INI, squadSection, "npc_in_squad", 1, 2);
    const randomSpawn: LuaArray<string> = parseStringsList(randomSpawnConfig)!;

    if (countMin > countMax) {
      abort("When spawning squad min count can't be greater then max count in '%s'.", squadSection);
    }

    for (const _ of $range(1, math.random(countMin, countMax))) {
      squad.addMember(
        randomSpawn!.get(math.random(1, randomSpawn!.length())),
        baseSpawnPosition,
        baseLevelVertexId,
        baseGameVertexId
      );
    }
  }

  squad.assignedSmartTerrainId = spawnSmartTerrain.id;

  updateSquadMapSpot(squad);
}
