import { clsid, level, patrol } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { removeSquadMapSpot, updateSquadMapSpot } from "@/engine/core/managers/map/utils/map_spot_squad";
import { updateTerrainMapSpot } from "@/engine/core/managers/map/utils/map_spot_terrain";
import { GROUP_ID_BY_LEVEL_NAME, simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/types";
import { getSimulationTerrainAssignedSquadsCount } from "@/engine/core/managers/simulation/utils/simulation_data";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { abort } from "@/engine/core/utils/assertion";
import { setObjectTeamSquadGroup } from "@/engine/core/utils/community";
import {
  parseConditionsList,
  parseStringsList,
  pickSectionFromCondList,
  readIniString,
  readIniTwoNumbers,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setSquadRelationToActor } from "@/engine/core/utils/relation";
import { TLevel } from "@/engine/lib/constants/levels";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { NIL } from "@/engine/lib/constants/words";
import {
  LuaArray,
  Optional,
  Patrol,
  ServerCreatureObject,
  ServerObject,
  TName,
  TNumberId,
  TSection,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Register squad in alife simulation.
 *
 * @param squad - target squad to register
 */
export function registerSimulationSquad(squad: Squad): void {
  simulationConfig.SQUADS.set(squad.id, squad);
}

/**
 * Unregister squad from simulation.
 *
 * @param squad - target squad to unregister
 */
export function unRegisterSimulationSquad(squad: Squad): void {
  simulationConfig.SQUADS.delete(squad.id);
}

/**
 * Create squad in smart terrain.
 *
 * @param terrain - target terrain to create in
 * @param section - name of squad section to create
 * @returns newly created squad
 */
export function createSimulationSquad(terrain: SmartTerrain, section: TSection): Squad {
  simulationLogger.info("Create squad: '%s' -> '%s'.", terrain.name(), section);

  const squad: Squad = registry.simulator.create<Squad>(
    section,
    terrain.position,
    terrain.m_level_vertex_id,
    terrain.m_game_vertex_id
  );

  createSimulationSquadMembers(squad, terrain);

  if (squad.relationship) {
    setSquadRelationToActor(squad, squad.relationship);
  }

  assignSimulationSquadToTerrain(squad, terrain.id);

  for (const squadMember of squad.squad_members()) {
    setupSimulationObjectSquadAndGroup(squadMember.object);
  }

  return squad;
}

/**
 * Spawn default squad members for provided squad / smart terrain.
 * Selects configuration based objects to spawn and assign to the squad.
 *
 * Contains strictly defined objects for the squad and random sections with random count to fill the squad.
 *
 * @param squad - target squad to spawn members for
 * @param spawnTerrain - parent smart terrain assigned to squad
 */
export function createSimulationSquadMembers(squad: Squad, spawnTerrain: SmartTerrain): void {
  const squadSection: TSection = squad.section_name();
  const spawnSections: LuaArray<TSection> = parseStringsList(
    readIniString(SYSTEM_INI, squadSection, "npc", false, null, "")
  );
  const spawnPointData: string =
    readIniString(SYSTEM_INI, squadSection, "spawn_point", false) ??
    readIniString(spawnTerrain.ini, SMART_TERRAIN_SECTION, "spawn_point", false) ??
    "self";
  const spawnPoint: Optional<TName> = pickSectionFromCondList(
    registry.actor,
    squad,
    parseConditionsList(spawnPointData)
  );
  const spawnPointName: Optional<TName> =
    spawnPoint && spawnPoint !== NIL ? spawnPoint : (spawnTerrain.spawnPointName as TName);
  const randomSpawnConfig: Optional<string> = readIniString(SYSTEM_INI, squadSection, "npc_random", false);

  if (!randomSpawnConfig && spawnSections.length() === 0) {
    abort("Unexpected attempt to spawn an empty squad '%s'.", squadSection);
  }

  logger.info("Create squad members: %s %s %s %s", squad.name(), spawnTerrain?.name(), spawnPointData, spawnPoint);

  let baseSpawnPosition: Vector;
  let baseLevelVertexId: TNumberId;
  let baseGameVertexId: TNumberId;

  if (spawnPointName && spawnPointName !== "self") {
    const destination: Patrol = new patrol(spawnPointName);

    baseSpawnPosition = destination.point(0);
    baseLevelVertexId = destination.level_vertex_id(0);
    baseGameVertexId = destination.game_vertex_id(0);
  } else {
    baseSpawnPosition = spawnTerrain.position;
    baseLevelVertexId = spawnTerrain.m_level_vertex_id;
    baseGameVertexId = spawnTerrain.m_game_vertex_id;
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

  squad.assignedTerrainId = spawnTerrain.id;

  updateSquadMapSpot(squad);
}

/**
 * Release squad and squad members.
 * Un-assigns squad from smart terrain and then releases all squad members.
 *
 * todo: part of smart terrain class?
 *
 * @param squad - target squad object to remove with members including
 */
export function releaseSimulationSquad(squad: Squad): void {
  simulationLogger.info("Release squad: '%s'.", squad.name());

  assignSimulationSquadToTerrain(squad, null);

  const squadMembers: LuaTable<TNumberId, boolean> = new LuaTable();

  for (const squadMember of squad.squad_members()) {
    squadMembers.set(squadMember.id, true);
  }

  // Second loop is to prevent iteration breaking when iterating + mutating?
  for (const [id] of squadMembers) {
    const object: Optional<ServerObject> = registry.simulator.object(id);

    if (object !== null) {
      squad.unregister_member(id);
      registry.simulator.release(object, true);
    }
  }

  // todo: onReleased callback in squad object.
  // todo: global event in events manager.
  removeSquadMapSpot(squad);
}

/**
 * todo;
 * todo: Seems too complex.
 */
export function setupSimulationObjectSquadAndGroup(object: ServerCreatureObject): void {
  const levelName: TLevel = level.name();
  const groupId: TNumberId = GROUP_ID_BY_LEVEL_NAME.get(levelName) || 0;

  // Reload, probably not needed.
  object = registry.simulator.object(object.id)!;

  // todo: Check, probably magic or unused code with duplicated changeTeam calls.
  setObjectTeamSquadGroup(object, object.team, object.squad, groupId);

  const squad: Optional<Squad> = registry.simulator.object<Squad>(object.group_id);

  if (squad === null) {
    return setObjectTeamSquadGroup(object, object.team, 0, object.group);
  }

  let terrain: Optional<SmartTerrain> = null;

  if (squad.currentAction !== null && squad.currentAction.type === ESquadActionType.REACH_TARGET) {
    terrain = registry.simulator.object<SmartTerrain>(squad.assignedTargetId!);
  } else if (squad.assignedTerrainId !== null) {
    terrain = registry.simulator.object<SmartTerrain>(squad.assignedTerrainId);
  }

  if (terrain === null) {
    return setObjectTeamSquadGroup(object, object.team, 0, object.group);
  }

  let objectSquadId: TNumberId = 0;

  if (terrain.clsid() === clsid.smart_terrain) {
    objectSquadId = terrain.squadId;
  }

  setObjectTeamSquadGroup(object, object.team, objectSquadId, object.group);
}

/**
 * todo: Description.
 */
export function assignSimulationSquadToTerrain(squad: Squad, terrainId: Optional<TNumberId>): void {
  simulationLogger.info("Assign squad to smart terrain: '%s' -> '%s'.", squad.name(), terrainId);

  if (terrainId !== null && !simulationConfig.TERRAIN_DESCRIPTORS.has(terrainId)) {
    if (!simulationConfig.TEMPORARY_ASSIGNED_SQUADS.has(terrainId)) {
      simulationConfig.TEMPORARY_ASSIGNED_SQUADS.set(terrainId, new LuaTable());
    }

    table.insert(simulationConfig.TEMPORARY_ASSIGNED_SQUADS.get(terrainId), squad);

    return;
  }

  const oldTerrainId: Optional<TNumberId> = squad.assignedTerrainId;
  const oldTerrainDescriptor: Optional<ISmartTerrainDescriptor> = oldTerrainId
    ? simulationConfig.TERRAIN_DESCRIPTORS.get(oldTerrainId)
    : null;

  if (oldTerrainDescriptor) {
    const oldTerrain: SmartTerrain = oldTerrainDescriptor.terrain;

    oldTerrainDescriptor.assignedSquads.delete(squad.id);
    oldTerrainDescriptor.assignedSquadsCount = getSimulationTerrainAssignedSquadsCount(oldTerrainId as TNumberId);

    updateTerrainMapSpot(oldTerrain);
  }

  if (terrainId === null) {
    squad.assignToTerrain(null);
  } else {
    const newTerrainDescriptor: ISmartTerrainDescriptor = simulationConfig.TERRAIN_DESCRIPTORS.get(terrainId);

    squad.assignToTerrain(newTerrainDescriptor.terrain);

    newTerrainDescriptor.assignedSquads.set(squad.id, squad);
    newTerrainDescriptor.assignedSquadsCount = getSimulationTerrainAssignedSquadsCount(terrainId);

    updateTerrainMapSpot(newTerrainDescriptor.terrain);
  }
}
