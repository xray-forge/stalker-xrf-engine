import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";

describe("registry storage", () => {
  it("storage to contain all fields", () => {
    expect(Object.keys(registry)).toHaveLength(43);
  });

  it("storage to initialize with correct data", () => {
    expect(registry.simulator).toBeNull();
    expect(registry.actorServer).toBeNull();
    expect(registry.actor).toBeNull();
    expect(registry.activeSpeaker).toBeNull();
    expect(registry.activeSmartTerrainId).toBeNull();
    expect(registry.managers instanceof LuaTable).toBeTruthy();
    expect(registry.schemes instanceof LuaTable).toBeTruthy();
    expect(registry.cache.conditionLists instanceof LuaTable).toBeTruthy();
    expect(registry.actorCombat instanceof LuaTable).toBeTruthy();
    expect(registry.objects instanceof LuaTable).toBeTruthy();
    expect(registry.objectsWounded instanceof LuaTable).toBeTruthy();
    expect(registry.offlineObjects instanceof LuaTable).toBeTruthy();
    expect(registry.simulationObjects instanceof LuaTable).toBeTruthy();
    expect(registry.storyLink.sidById instanceof LuaTable).toBeTruthy();
    expect(registry.storyLink.idBySid instanceof LuaTable).toBeTruthy();
    expect(registry.stalkers instanceof LuaTable).toBeTruthy();
    expect(registry.trade instanceof LuaTable).toBeTruthy();
    expect(registry.camps instanceof LuaTable).toBeTruthy();
    expect(registry.crows.storage instanceof LuaTable).toBeTruthy();
    expect(registry.crows.count).toBe(0);
    expect(registry.helicopter.storage instanceof LuaTable).toBeTruthy();
    expect(registry.helicopter.enemies instanceof LuaTable).toBeTruthy();
    expect(registry.helicopter.enemyIndex).toBe(0);
    expect(registry.anomalyZones instanceof LuaTable).toBeTruthy();
    expect(registry.anomalyFields instanceof LuaTable).toBeTruthy();
    expect(registry.artefacts.ways instanceof LuaTable).toBeTruthy();
    expect(registry.artefacts.points instanceof LuaTable).toBeTruthy();
    expect(registry.artefacts.parentZones instanceof LuaTable).toBeTruthy();
    expect(registry.goodwill.sympathy instanceof LuaTable).toBeTruthy();
    expect(registry.goodwill.relations instanceof LuaTable).toBeTruthy();
    expect(registry.zones instanceof LuaTable).toBeTruthy();
    expect(registry.signalLights instanceof LuaTable).toBeTruthy();
    expect(registry.noWeaponZones instanceof LuaTable).toBeTruthy();
    expect(registry.lightZones instanceof LuaTable).toBeTruthy();
    expect(registry.ini instanceof LuaTable).toBeTruthy();
    expect(registry.smartTerrains instanceof LuaTable).toBeTruthy();
    expect(registry.smartTerrainsCampfires instanceof LuaTable).toBeTruthy();
    expect(registry.smartTerrainNearest.id).toBeNull();
    expect(registry.smartTerrainNearest.distance).toBe(math.huge);
    expect(registry.smartCovers instanceof LuaTable).toBeTruthy();
    expect(registry.doors instanceof LuaTable).toBeTruthy();
    expect(registry.saveMarkers instanceof LuaTable).toBeTruthy();
    expect(registry.signalLights instanceof LuaTable).toBeTruthy();
    expect(registry.spawnedVertexes instanceof LuaTable).toBeTruthy();
    expect(registry.patrols).toEqualLuaTables({ generic: {}, reachTask: {} });
    expect(registry.patrolSynchronization instanceof LuaTable).toBeTruthy();
    expect(registry.sounds.musicVolume).toBe(0);
    expect(registry.sounds.effectsVolume).toBe(0);
    expect(registry.sounds.generic instanceof LuaTable).toBeTruthy();
    expect(registry.sounds.looped instanceof LuaTable).toBeTruthy();
    expect(registry.sounds.themes instanceof LuaTable).toBeTruthy();
    expect(registry.sounds.managers instanceof LuaTable).toBeTruthy();
    expect(registry.noCombatZones instanceof LuaTable).toBeTruthy();
    expect(registry.noCombatSmartTerrains instanceof LuaTable).toBeTruthy();
    expect(registry.baseSmartTerrains instanceof LuaTable).toBeTruthy();
    expect(registry.extensions instanceof LuaTable).toBeTruthy();
  });
});
