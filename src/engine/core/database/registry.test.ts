import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";

describe("registry storage", () => {
  it("storage to contain all fields", () => {
    expect(Object.keys(registry)).toHaveLength(45);
  });

  it("storage to initialize with correct data", () => {
    expect(registry.musicVolume).toBe(0);
    expect(registry.effectsVolume).toBe(0);
    expect(registry.simulator).toBeNull();
    expect(registry.actorServer).toBeNull();
    expect(registry.actor).toBeNull();
    expect(registry.activeSpeaker).toBeNull();
    expect(registry.activeSmartTerrainId).toBeNull();
    expect(registry.managers).toBeInstanceOf(LuaTable);
    expect(registry.schemes).toBeInstanceOf(LuaTable);
    expect(registry.cache.conditionLists).toBeInstanceOf(LuaTable);
    expect(registry.actorCombat).toBeInstanceOf(LuaTable);
    expect(registry.objects).toBeInstanceOf(LuaTable);
    expect(registry.objectsWounded).toBeInstanceOf(LuaTable);
    expect(registry.offlineObjects).toBeInstanceOf(LuaTable);
    expect(registry.simulationObjects).toBeInstanceOf(LuaTable);
    expect(registry.storyLink.sidById).toBeInstanceOf(LuaTable);
    expect(registry.storyLink.idBySid).toBeInstanceOf(LuaTable);
    expect(registry.stalkers).toBeInstanceOf(LuaTable);
    expect(registry.trade).toBeInstanceOf(LuaTable);
    expect(registry.camps).toBeInstanceOf(LuaTable);
    expect(registry.crows.storage).toBeInstanceOf(LuaTable);
    expect(registry.crows.count).toBe(0);
    expect(registry.helicopter.storage).toBeInstanceOf(LuaTable);
    expect(registry.helicopter.enemies).toBeInstanceOf(LuaTable);
    expect(registry.helicopter.enemyIndex).toBe(0);
    expect(registry.anomalyZones).toBeInstanceOf(LuaTable);
    expect(registry.anomalyFields).toBeInstanceOf(LuaTable);
    expect(registry.artefacts.ways).toBeInstanceOf(LuaTable);
    expect(registry.artefacts.points).toBeInstanceOf(LuaTable);
    expect(registry.artefacts.parentZones).toBeInstanceOf(LuaTable);
    expect(registry.goodwill.sympathy).toBeInstanceOf(LuaTable);
    expect(registry.goodwill.relations).toBeInstanceOf(LuaTable);
    expect(registry.zones).toBeInstanceOf(LuaTable);
    expect(registry.signalLights).toBeInstanceOf(LuaTable);
    expect(registry.noWeaponZones).toBeInstanceOf(LuaTable);
    expect(registry.lightZones).toBeInstanceOf(LuaTable);
    expect(registry.ini).toBeInstanceOf(LuaTable);
    expect(registry.smartTerrains).toBeInstanceOf(LuaTable);
    expect(registry.smartTerrainsCampfires).toBeInstanceOf(LuaTable);
    expect(registry.smartTerrainNearest.id).toBeNull();
    expect(registry.smartTerrainNearest.distanceSqr).toBe(math.huge);
    expect(registry.smartCovers).toBeInstanceOf(LuaTable);
    expect(registry.doors).toBeInstanceOf(LuaTable);
    expect(registry.ranks.stalker).toBeInstanceOf(LuaTable);
    expect(registry.ranks.monster).toBeInstanceOf(LuaTable);
    expect(registry.ranks.maxStalkerRank).toBeNull();
    expect(registry.ranks.maxStalkerRank).toBeNull();
    expect(registry.saveMarkers).toBeInstanceOf(LuaTable);
    expect(registry.signalLights).toBeInstanceOf(LuaTable);
    expect(registry.spawnedVertexes).toBeInstanceOf(LuaTable);
    expect(registry.patrolSynchronization).toBeInstanceOf(LuaTable);
    expect(registry.noCombatZones).toBeInstanceOf(LuaTable);
    expect(registry.noCombatSmartTerrains).toBeInstanceOf(LuaTable);
    expect(registry.baseSmartTerrains).toBeInstanceOf(LuaTable);
    expect(registry.extensions).toBeInstanceOf(LuaTable);
    expect(registry.dynamicData).toBeInstanceOf(Object);
  });
});
