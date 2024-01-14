import { beforeEach, describe, expect, it } from "@jest/globals";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registerSimulator, registry } from "@/engine/core/database";
import {
  anomalyHasArtefact,
  getAnomalyArtefacts,
  getAnomalyFreePaths,
  spawnArtefactInAnomaly,
} from "@/engine/core/utils/anomaly";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockPatrol, mockServerAlifeObject } from "@/fixtures/xray";

describe("getAnomalyArtefacts util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get anomaly artefacts list", () => {
    expect(getAnomalyArtefacts("another")).toEqualLuaArrays([]);
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    const anomalyZoneBinder: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registry.anomalyZones.set("another-anomaly", anomalyZoneBinder);
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    anomalyZoneBinder.spawnedArtefactsCount = 3;
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    anomalyZoneBinder.artefactPathsByArtefactId.set(521, "sect_1");
    anomalyZoneBinder.artefactPathsByArtefactId.set(522, "sect_2");
    anomalyZoneBinder.artefactPathsByArtefactId.set(523, "sect_3");
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    mockServerAlifeObject({ id: 521, section_name: <T>() => "sect_1" as T });
    mockServerAlifeObject({ id: 523, section_name: <T>() => "sect_3" as T });

    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays(["sect_1", "sect_3"]);
  });
});

describe("anomalyHasArtefact util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if anomaly has artefact", () => {
    expect(anomalyHasArtefact("another", "")).toBe(false);
    expect(anomalyHasArtefact("test-anomaly", "")).toBe(false);
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    const anomalyZoneBinder: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registry.anomalyZones.set("test-anomaly", anomalyZoneBinder);
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    anomalyZoneBinder.spawnedArtefactsCount = 3;
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    anomalyZoneBinder.artefactPathsByArtefactId.set(511, "sect_1");
    anomalyZoneBinder.artefactPathsByArtefactId.set(512, "sect_2");
    anomalyZoneBinder.artefactPathsByArtefactId.set(513, "sect_3");
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    mockServerAlifeObject({ id: 511, section_name: <T>() => "sect_1" as T });
    mockServerAlifeObject({ id: 512, section_name: <T>() => "sect_2" as T });

    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(true);
    expect(anomalyHasArtefact("test-anomaly", "sect_2")).toBe(true);
    expect(anomalyHasArtefact("test-anomaly", "sect_3")).toBe(false);
  });
});

describe("spawnArtefactInAnomaly util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly spawn artefacts in anomaly", () => {
    const anomaly: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact: ServerObject = spawnArtefactInAnomaly(anomaly, "test-artefact", "test-wp-single");

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test-artefact",
      MockPatrol.mock("test-wp-single").point(0),
      anomaly.object.level_vertex_id(),
      anomaly.object.game_vertex_id()
    );

    expect(anomaly.spawnedArtefactsCount).toBe(1);
    expect(anomaly.artefactPathsByArtefactId.get(artefact.id)).toBe("test-wp-single");
    expect(anomaly.artefactPointsByArtefactId.get(artefact.id)).toBe(0);

    expect(registry.artefacts.parentZones.get(artefact.id)).toBe(anomaly);
    expect(registry.artefacts.ways.get(artefact.id)).toBe("test-wp-single");
    expect(registry.artefacts.points.get(artefact.id)).toBe(0);
  });
});

describe("getAnomalyFreePaths util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get free patrols not used by artefacts", () => {
    const object: GameObject = MockGameObject.mock();
    const anomaly: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    anomaly.currentZoneLayer = "layer-1";
    anomaly.artefactsPathsList.set("layer-1", $fromArray(["a", "b", "c", "d"]));

    anomaly.artefactPathsByArtefactId.set(10, "a");
    anomaly.artefactPathsByArtefactId.set(11, "c");

    expect(getAnomalyFreePaths(anomaly)).toEqualLuaArrays(["b", "d"]);
  });
});
