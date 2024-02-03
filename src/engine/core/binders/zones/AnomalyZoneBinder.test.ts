import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { IRegistryObjectState, registerSimulator, registry } from "@/engine/core/database";
import { spawnArtefactInAnomaly } from "@/engine/core/utils/anomaly";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockGameObject, MockObjectBinder } from "@/fixtures/xray";

describe("AnomalyZoneBinder", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    // todo;
  });

  it("should correctly handle disabled spawn", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    MockObjectBinder.asMock(binder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);

    expect(registry.anomalyZones.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online and offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    expect(registry.anomalyZones.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);

    binder.net_spawn(serverObject);

    expect(registry.anomalyZones.length()).toBe(1);
    expect(registry.anomalyZones.get(object.name())).toBe(binder);
    expect(registry.zones.length()).toBe(1);
    expect(registry.zones.get(object.name())).toBe(object);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(object.id()).object).toBe(object);

    binder.net_destroy();

    expect(registry.anomalyZones.length()).toBe(0);
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

  it.todo("should correctly handle save/load");

  it.todo("should correctly handle disabling anomaly fields");

  it.todo("should correctly handle respawn artefacts and changing anomalies layouts");

  it.todo("should correctly spawn random artefacts");

  it.todo("should correctly handle artefact paths");

  it.todo("should correctly handle update event");

  it.todo("should correctly handle artefact taking");

  it.todo("should correctly get artefacts lists for section");

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

  it("should correctly get free patrol to use for new artefacts", () => {
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

  it("should handle artefact being taken from anomaly", () => {
    const artefact: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    binder.spawnedArtefactsCount = 3;

    binder.artefactPathsByArtefactId.set(artefact.id(), "test-way");
    binder.artefactPointsByArtefactId.set(artefact.id(), 15);

    registry.artefacts.ways.set(artefact.id(), "test-way");
    registry.artefacts.points.set(artefact.id(), 15);

    binder.onArtefactTaken(artefact.id());

    expect(binder.spawnedArtefactsCount).toBe(2);
    expect(binder.artefactPathsByArtefactId.length()).toBe(0);
    expect(registry.artefacts.ways.length()).toBe(0);
    expect(registry.artefacts.points.length()).toBe(0);
  });
});
