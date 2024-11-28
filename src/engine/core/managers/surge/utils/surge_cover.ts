import { level } from "xray16";

import { getManager, registry } from "@/engine/core/database";
import { ESimulationTerrainRole, SimulationManager } from "@/engine/core/managers/simulation";
import { SURGE_MANAGER_CONFIG_LTX, surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { parseConditionsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TLevel } from "@/engine/lib/constants/levels";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, LuaArray, Optional, TDistance } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @returns whether actor is in surge cover right now
 */
export function isActorInSurgeCover(): boolean {
  return getNearestAvailableSurgeCover(registry.actor)?.inside(registry.actor.position()) === true;
}

/**
 * todo;
 *
 * @param squad
 */
export function canSurgeKillSquad(squad: Squad): boolean {
  const simulationManager: SimulationManager = getManager(SimulationManager);

  if (!squad.assignedTerrainId) {
    return false;
  }

  const terrain: Optional<SmartTerrain> = simulationManager.getTerrainDescriptorById(squad.assignedTerrainId)
    ?.terrain as Optional<SmartTerrain>;

  return terrain !== null && tonumber(terrain.simulationProperties.get(ESimulationTerrainRole.SURGE))! <= 0;
}

/**
 * todo: Description.
 */
export function initializeSurgeCovers(): void {
  const levelName: TLevel = level.name();

  surgeConfig.SURGE_COVERS = new LuaTable();

  if (!SURGE_MANAGER_CONFIG_LTX.section_exist(levelName)) {
    return logger.info("No surge covers for current level: '%s'", levelName);
  }

  // Read list of possible surge covers for current level.
  for (const index of $range(0, SURGE_MANAGER_CONFIG_LTX.line_count(levelName) - 1)) {
    const [, name] = SURGE_MANAGER_CONFIG_LTX.r_line(levelName, index, "", "");

    // Collect covers names + condition lists if declared.
    table.insert(surgeConfig.SURGE_COVERS, {
      name,
      conditionList: SURGE_MANAGER_CONFIG_LTX.line_exist(name, "condlist")
        ? parseConditionsList(SURGE_MANAGER_CONFIG_LTX.r_string(name, "condlist"))
        : null,
    });
  }

  logger.info("Initialized surge covers: '%s' - %s", levelName, surgeConfig.SURGE_COVERS.length());
}

/**
 * @returns list of game objects representing possible covers registered online
 */
export function getOnlineSurgeCoversList(): LuaArray<GameObject> {
  const covers: LuaArray<GameObject> = new LuaTable();

  for (const [, descriptor] of surgeConfig.SURGE_COVERS) {
    const object: Optional<GameObject> = registry.zones.get(descriptor.name);

    if (object !== null) {
      table.insert(covers, object);
    }
  }

  return covers;
}

/**
 * todo;
 */
export function getNearestAvailableSurgeCover(object: GameObject): Optional<GameObject> {
  let nearestCover: Optional<GameObject> = null;
  let nearestCoverDistance: TDistance = MAX_U32;

  /**
   * Check if cover can be actually used and then mark as possible cover.
   * - Alarms
   * - Quest conditions
   * - Blocked by different conditions
   */
  for (const [, descriptor] of surgeConfig.SURGE_COVERS) {
    const zone: Optional<GameObject> = registry.zones.get(descriptor.name);

    if (zone !== null) {
      const isValidCover: boolean =
        descriptor.conditionList === null ||
        pickSectionFromCondList(registry.actor, object, descriptor.conditionList) === TRUE;

      // If already somehow inside cover, mark as nearest and active.
      if (zone.inside(object.position())) {
        return zone;
      }

      // Check distance only if cover is valid, and it makes sense to travel to it.
      if (isValidCover) {
        const distanceSqr: TDistance = zone.position().distance_to_sqr(object.position());

        if (distanceSqr < nearestCoverDistance) {
          nearestCover = zone;
          nearestCoverDistance = distanceSqr;
        }
      }
    }
  }

  return nearestCover;
}

/**
 * Get target surge cover ID for actor to navigate to.
 *
 * @returns nearest cover ID if it exists or null if none found / actor in one currently.
 */
export function getActorTargetSurgeCover(): Optional<GameObject> {
  const coverObject: Optional<GameObject> = getNearestAvailableSurgeCover(registry.actor);

  // No covers or already in cover -> nothing to do.
  if (coverObject === null || coverObject.inside(registry.actor.position())) {
    return null;
  } else {
    return coverObject;
  }
}
