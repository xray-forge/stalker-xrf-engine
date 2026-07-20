import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerObject } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import {
  EMockPacketDataType,
  MockAlifeObject,
  MockGameObject,
  MockIniFile,
  MockNetProcessor,
  MockObjectBinder,
} from "xray16/mocks";

import { AnomalyFieldBinder } from "@/engine/core/binders/zones/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { IRegistryObjectState, registerSimulator, registry } from "@/engine/core/database";
import { spawnArtefactInAnomaly } from "@/engine/core/utils/anomaly";
import { resetRegistry } from "@/fixtures/engine";

function mockConfiguredAnomalyZoneBinder(): AnomalyZoneBinder {
  return new AnomalyZoneBinder(
    MockGameObject.mock({
      spawnIni: MockIniFile.mock("test_anomaly_zone.ltx", {
        anomal_zone: {
          respawn_tries: 2,
          max_artefacts: 3,
          applying_force_xz: 200,
          applying_force_y: 400,
          artefacts: "art_a, art_b",
          start_artefact: "art_initial",
          artefact_ways: "test-wp-single",
          coeff: "2, 3",
        },
        layer_1: {},
      }),
    })
  );
}

describe("AnomalyZoneBinder", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize", () => {
    const binder: AnomalyZoneBinder = mockConfiguredAnomalyZoneBinder();

    expect(binder.isDisabled).toBe(false);
    expect(binder.currentZoneLayer).toBe("layer_1");
    expect(binder.respawnTries).toBe(2);
    expect(binder.maxArtefactsInZone).toBe(3);
    expect(binder.applyingForceXZ).toBe(200);
    expect(binder.applyingForceY).toBe(400);
    expect(binder.artefactsStartList.get("layer_1")).toEqualLuaTables({ 1: "art_initial" });
    expect(binder.artefactsSpawnList.get("layer_1")).toEqualLuaTables({ 1: "art_a", 2: "art_b" });
    expect(binder.artefactsSpawnCoefficients.get("layer_1")).toEqualLuaTables({ 1: 2, 2: 3 });
    expect(binder.artefactsPathsList.get("layer_1")).toEqualLuaTables({ 1: "test-wp-single" });
  });

  it("should correctly handle disabled spawn", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    MockObjectBinder.asMock(binder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);

    expect(table.size(registry.anomalyZones)).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online and offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    expect(table.size(registry.anomalyZones)).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);

    binder.net_spawn(serverObject);

    expect(table.size(registry.anomalyZones)).toBe(1);
    expect(registry.anomalyZones.get(object.name())).toBe(binder);
    expect(registry.zones.length()).toBe(1);
    expect(registry.zones.get(object.name())).toBe(object);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(object.id()).object).toBe(object);

    binder.net_destroy();

    expect(table.size(registry.anomalyZones)).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly reinit", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    binder.net_spawn(serverObject);

    const state: IRegistryObjectState = registry.objects.get(object.id());

    binder.reinit();

    expect(registry.objects.get(object.id())).not.toBe(state);
    expect(registry.objects.get(object.id()).object).toBe(object);
  });

  it("should be net save relevant", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle save/load", () => {
    const processor: MockNetProcessor = new MockNetProcessor();
    const binder: AnomalyZoneBinder = mockConfiguredAnomalyZoneBinder();
    const artefact = spawnArtefactInAnomaly(binder, "test-artefact", "test-wp-single");

    binder.shouldRespawnArtefactsIfPossible = false;
    binder.isForcedToSpawn = false;
    binder.hasForcedSpawnOverride = true;
    binder.forcedArtefact = "art_forced";
    binder.isTurnedOff = true;

    binder.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EMockPacketDataType.STRING,
      EMockPacketDataType.U16,
      EMockPacketDataType.U16,
      EMockPacketDataType.STRING,
      EMockPacketDataType.U16,
      EMockPacketDataType.U16,
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.BOOLEAN,
      EMockPacketDataType.BOOLEAN,
      EMockPacketDataType.BOOLEAN,
      EMockPacketDataType.STRING,
      EMockPacketDataType.U8,
      EMockPacketDataType.BOOLEAN,
      EMockPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      "save_from_AnomalyZoneBinder",
      1,
      artefact.id,
      "test-wp-single",
      1,
      artefact.id,
      binder.artefactPointsByArtefactId.get(artefact.id),
      1,
      false,
      false,
      true,
      "art_forced",
      1,
      true,
      14,
    ]);

    const loadedBinder: AnomalyZoneBinder = mockConfiguredAnomalyZoneBinder();

    loadedBinder.load(processor.asNetReader());

    expect(loadedBinder.artefactPathsByArtefactId.get(artefact.id)).toBe("test-wp-single");
    expect(loadedBinder.artefactPointsByArtefactId.has(artefact.id)).toBe(true);
    expect(registry.artefacts.parentZones.get(artefact.id)).toBe(loadedBinder);
    expect(loadedBinder.spawnedArtefactsCount).toBe(1);
    expect(loadedBinder.shouldRespawnArtefactsIfPossible).toBe(false);
    expect(loadedBinder.isForcedToSpawn).toBe(false);
    expect(loadedBinder.hasForcedSpawnOverride).toBe(true);
    expect(loadedBinder.forcedArtefact).toBe("art_forced");
    expect(loadedBinder.isTurnedOff).toBe(true);
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it("disables inactive anomaly fields and enables fields in the current layer", () => {
    const binder: AnomalyZoneBinder = mockConfiguredAnomalyZoneBinder();
    const currentField: AnomalyFieldBinder = new AnomalyFieldBinder(MockGameObject.mock());
    const inactiveField: AnomalyFieldBinder = new AnomalyFieldBinder(MockGameObject.mock());

    jest.spyOn(currentField, "setEnabled").mockImplementation(jest.fn());
    jest.spyOn(inactiveField, "setEnabled").mockImplementation(jest.fn());

    binder.isCustomPlacement = true;
    binder.currentZoneLayer = "layer_1";
    binder.layerFieldsTable.set("layer_1", $fromArray(["current_field"]));
    binder.layerFieldsTable.set("layer_2", $fromArray(["inactive_field"]));
    binder.layerMinesTable.set("layer_1", new LuaTable());
    binder.layerMinesTable.set("layer_2", new LuaTable());
    registry.anomalyFields.set("current_field", currentField);
    registry.anomalyFields.set("inactive_field", inactiveField);

    binder.switchAnomalyFields();

    expect(currentField.setEnabled).toHaveBeenCalledWith(true);
    expect(inactiveField.setEnabled).toHaveBeenCalledWith(false);
    expect(binder.isDisabled).toBe(true);
  });

  it("changes layers, switches their fields, and refreshes respawn settings", () => {
    const binder: AnomalyZoneBinder = mockConfiguredAnomalyZoneBinder();
    const firstField: AnomalyFieldBinder = new AnomalyFieldBinder(MockGameObject.mock());
    const secondField: AnomalyFieldBinder = new AnomalyFieldBinder(MockGameObject.mock());

    jest.spyOn(firstField, "setEnabled").mockImplementation(jest.fn());
    jest.spyOn(secondField, "setEnabled").mockImplementation(jest.fn());

    const randomSpy = jest.spyOn(math, "random").mockReturnValue(2);

    binder.isCustomPlacement = true;
    binder.zoneLayersCount = 2;
    binder.currentZoneLayer = "layer_1";
    binder.layerFieldsTable.set("layer_1", $fromArray(["first_field"]));
    binder.layerFieldsTable.set("layer_2", $fromArray(["second_field"]));
    binder.layerMinesTable.set("layer_1", new LuaTable());
    binder.layerMinesTable.set("layer_2", new LuaTable());
    binder.layersRespawnTriesTable.set("layer_2", 4);
    binder.layersMaxArtefactsTable.set("layer_2", 5);
    binder.layersForcesTable.set("layer_2", { xz: 600, y: 700 });
    registry.anomalyFields.set("first_field", firstField);
    registry.anomalyFields.set("second_field", secondField);

    binder.respawnArtefactsAndChangeLayers();

    expect(binder.shouldRespawnArtefactsIfPossible).toBe(true);
    expect(binder.currentZoneLayer).toBe("layer_2");
    expect(binder.respawnTries).toBe(4);
    expect(binder.maxArtefactsInZone).toBe(5);
    expect(binder.applyingForceXZ).toBe(600);
    expect(binder.applyingForceY).toBe(700);
    expect(firstField.setEnabled).toHaveBeenCalledWith(false);
    expect(secondField.setEnabled).toHaveBeenCalledWith(true);

    randomSpy.mockRestore();
  });

  it("selects random, initial, and forced artefacts to spawn", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    binder.currentZoneLayer = "layer-1";
    binder.artefactsSpawnList.set("layer-1", $fromArray(["art_a", "art_b", "art_c"]));
    binder.artefactsSpawnCoefficients.set("layer-1", $fromArray([2, 3, 5]));

    const randomSpy = jest.spyOn(math, "random");

    randomSpy.mockReturnValueOnce(1).mockReturnValueOnce(1);
    expect(binder.getArtefactSectionToSpawn()).toBe("art_a");

    randomSpy.mockReturnValueOnce(1).mockReturnValueOnce(4);
    expect(binder.getArtefactSectionToSpawn()).toBe("art_b");

    randomSpy.mockReturnValueOnce(1).mockReturnValueOnce(10);
    expect(binder.getArtefactSectionToSpawn()).toBe("art_c");

    // Spawn-chance gate: a roll above ARTEFACT_SPAWN_CHANCE (17) yields no spawn.
    randomSpy.mockReturnValueOnce(100);
    expect(binder.getArtefactSectionToSpawn()).toBeNull();

    binder.artefactsStartList.set("layer-1", $fromArray(["art_initial"]));
    binder.isForcedToSpawn = true;
    expect(binder.getArtefactSectionToSpawn()).toBe("art_initial");

    binder.setForcedSpawnOverride("art_forced");
    expect(binder.getArtefactSectionToSpawn()).toBe("art_forced");
    expect(binder.hasForcedSpawnOverride).toBe(false);

    randomSpy.mockRestore();
  });

  it("should still switch anomaly fields on update while turned off", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    jest.spyOn(binder, "switchAnomalyFields").mockImplementation(jest.fn());
    jest.spyOn(binder, "getArtefactSectionToSpawn").mockImplementation(jest.fn(() => null));

    // Turned-off zone: spawning is skipped, but the per-tick field switch must still run:
    binder.isTurnedOff = true;
    binder.isDisabled = false;
    binder.shouldRespawnArtefactsIfPossible = true;
    binder.maxArtefactsInZone = 5;
    binder.spawnedArtefactsCount = 0;

    binder.update(1);

    expect(binder.getArtefactSectionToSpawn).not.toHaveBeenCalled();
    expect(binder.shouldRespawnArtefactsIfPossible).toBe(true);
    expect(binder.switchAnomalyFields).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle turn on", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    jest.spyOn(binder, "switchAnomalyFields").mockImplementation(jest.fn());

    binder.isTurnedOff = true;

    binder.turnOn(true);

    expect(binder.isTurnedOff).toBe(false);
    expect(binder.shouldRespawnArtefactsIfPossible).toBe(true);
    expect(binder.switchAnomalyFields).toHaveBeenCalled();
  });

  it("should correctly handle turn off", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    jest.spyOn(binder, "switchAnomalyFields").mockImplementation(jest.fn());

    binder.isTurnedOff = false;

    const first: ServerObject = spawnArtefactInAnomaly(binder, "test-artefact", "test-wp-single");
    const second: ServerObject = spawnArtefactInAnomaly(binder, "test-artefact", "test-wp-single");
    const third: ServerObject = spawnArtefactInAnomaly(binder, "test-artefact", "test-wp-single");

    expect(binder.spawnedArtefactsCount).toBe(3);
    expect(binder.spawnedArtefactsCount).toBe(3);
    expect(binder.artefactPathsByArtefactId.length()).toBe(3);
    expect(binder.artefactPointsByArtefactId.length()).toBe(3);
    expect(registry.artefacts.parentZones.length()).toBe(3);
    expect(registry.artefacts.points.length()).toBe(3);
    expect(registry.artefacts.ways.length()).toBe(3);

    binder.turnOff();

    expect(binder.switchAnomalyFields).toHaveBeenCalled();
    expect(registry.simulator.release).toHaveBeenCalledTimes(3);
    expect(registry.simulator.release).toHaveBeenCalledWith(first, true);
    expect(registry.simulator.release).toHaveBeenCalledWith(second, true);
    expect(registry.simulator.release).toHaveBeenCalledWith(third, true);

    expect(binder.isTurnedOff).toBe(true);
    expect(binder.spawnedArtefactsCount).toBe(0);
    expect(binder.artefactPathsByArtefactId.length()).toBe(0);
    expect(binder.artefactPointsByArtefactId.length()).toBe(0);

    expect(registry.artefacts.parentZones.length()).toBe(0);
    expect(registry.artefacts.points.length()).toBe(0);
    expect(registry.artefacts.ways.length()).toBe(0);
  });

  it("selects free artefact patrols and falls back when all paths are occupied", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    binder.currentZoneLayer = "layer-1";
    binder.artefactsPathsList.set("layer-1", $fromArray(["a", "b"]));

    binder.artefactPathsByArtefactId.set(10, "a");
    expect(binder.getNewArtefactPath()).toBe("b");

    binder.artefactPathsByArtefactId.set(10, "b");
    expect(binder.getNewArtefactPath()).toBe("a");

    binder.artefactPathsByArtefactId.set(11, "a");
    expect(["a", "b"]).toContain(binder.getNewArtefactPath());
  });

  it("should correctly handle forced spawn override", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    binder.setForcedSpawnOverride("test-section");

    expect(binder.hasForcedSpawnOverride).toBe(true);
    expect(binder.forcedArtefact).toBe("test-section");
  });

  it("cleans every artefact mapping and does not underflow when an artefact is taken repeatedly", () => {
    const artefact: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    binder.spawnedArtefactsCount = 1;

    binder.artefactPathsByArtefactId.set(artefact.id(), "test-way");
    binder.artefactPointsByArtefactId.set(artefact.id(), 15);

    registry.artefacts.ways.set(artefact.id(), "test-way");
    registry.artefacts.points.set(artefact.id(), 15);
    registry.artefacts.parentZones.set(artefact.id(), binder);

    binder.onArtefactTaken(artefact.id());
    binder.onArtefactTaken(artefact.id());

    expect(binder.spawnedArtefactsCount).toBe(0);
    expect(binder.artefactPathsByArtefactId.length()).toBe(0);
    expect(registry.artefacts.ways.length()).toBe(0);
    expect(registry.artefacts.points.length()).toBe(0);
    expect(registry.artefacts.parentZones.length()).toBe(0);
  });
});
