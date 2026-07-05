import { patrol } from "xray16";
import { Patrol, ServerObject } from "xray16/alias";
import { LuaArray, Nillable, TIndex, TName, TSection } from "xray16/lib";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registry } from "@/engine/core/database";

/**
 * @param name - Name of anomaly zone to check.
 * @param section - Name of artefact to search in the anomaly.
 * @returns Whether anomaly has artefact.
 */
export function anomalyHasArtefact(name: TName, section: TSection): boolean {
  const zone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(name);

  if (!zone || zone.spawnedArtefactsCount < 1) {
    return false;
  }

  for (const [id] of zone.artefactPathsByArtefactId) {
    const object: Nillable<ServerObject> = registry.simulator.object(id);

    if (object && object.section_name() === section) {
      return true;
    }
  }

  return false;
}

/**
 * @param name - Name of anomaly zone to check.
 * @returns List of artefacts in the anomaly.
 */
export function getAnomalyArtefacts(name: TName): LuaArray<TSection> {
  const zone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(name);
  const artefacts: LuaArray<TName> = new LuaTable();

  if (!zone || zone.spawnedArtefactsCount < 1) {
    return artefacts;
  }

  for (const [id] of zone.artefactPathsByArtefactId) {
    const object: Nillable<ServerObject> = registry.simulator.object(id);

    if (object) {
      table.insert(artefacts, object.section_name());
    }
  }

  return artefacts;
}

/**
 * @returns List of current layer paths that are not used by existing artefacts.
 */
export function getAnomalyFreePaths(anomaly: AnomalyZoneBinder): LuaArray<TSection> {
  const paths: LuaArray<TName> = new LuaTable();

  for (const [, patrolName] of anomaly.artefactsPathsList.get(anomaly.currentZoneLayer)) {
    let isSpawned: boolean = false;

    for (const [, spawnedArtefactPatrolName] of anomaly.artefactPathsByArtefactId) {
      if (patrolName === spawnedArtefactPatrolName) {
        isSpawned = true;
      }
    }

    if (!isSpawned) {
      table.insert(paths, patrolName);
    }
  }

  return paths;
}

/**
 * Spawn artefact in provided anomaly object.
 *
 * @param anomaly - Anomaly zone to follow.
 * @param artefact - Section of artefact to spawn.
 * @param pathName - Name of patrol to follow in anomaly.
 */
export function spawnArtefactInAnomaly(anomaly: AnomalyZoneBinder, artefact: TSection, pathName: TName): ServerObject {
  const path: Patrol = new patrol(pathName);
  const point: TIndex = math.random(0, path.count() - 1);

  const object: ServerObject = registry.simulator.create(
    artefact,
    path.point(point),
    anomaly.object.level_vertex_id(),
    anomaly.object.game_vertex_id()
  );

  anomaly.spawnedArtefactsCount += 1;
  anomaly.artefactPathsByArtefactId.set(object.id, pathName);
  anomaly.artefactPointsByArtefactId.set(object.id, point);

  registry.artefacts.parentZones.set(object.id, anomaly);
  registry.artefacts.ways.set(object.id, pathName);
  registry.artefacts.points.set(object.id, point);

  return object;
}
