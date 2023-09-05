import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders/zones/AnomalyZoneBinder";
import { anomalyHasArtefact, getAnomalyArtefacts } from "@/engine/core/utils/object/object_anomaly";
import { mockClientGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("'object_anomaly' utils", () => {
  it("'anomalyHasArtefact' should correctly check if anomaly has artefact", () => {
    expect(anomalyHasArtefact("another", "")).toBe(false);
    expect(anomalyHasArtefact("test-anomaly", "")).toBe(false);
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    const anomalyZoneBinder: AnomalyZoneBinder = new AnomalyZoneBinder(mockClientGameObject());

    registry.anomalyZones.set("test-anomaly", anomalyZoneBinder);
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    anomalyZoneBinder.spawnedArtefactsCount = 3;
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    anomalyZoneBinder.artefactWaysByArtefactId.set(511, "sect_1");
    anomalyZoneBinder.artefactWaysByArtefactId.set(512, "sect_2");
    anomalyZoneBinder.artefactWaysByArtefactId.set(513, "sect_3");
    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(false);

    mockServerAlifeObject({ id: 511, section_name: <T>() => "sect_1" as T });
    mockServerAlifeObject({ id: 512, section_name: <T>() => "sect_2" as T });

    expect(anomalyHasArtefact("test-anomaly", "sect_1")).toBe(true);
    expect(anomalyHasArtefact("test-anomaly", "sect_2")).toBe(true);
    expect(anomalyHasArtefact("test-anomaly", "sect_3")).toBe(false);
  });

  it("'getAnomalyArtefacts' should correctly get anomaly artefacts list", () => {
    expect(getAnomalyArtefacts("another")).toEqualLuaArrays([]);
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    const anomalyZoneBinder: AnomalyZoneBinder = new AnomalyZoneBinder(mockClientGameObject());

    registry.anomalyZones.set("another-anomaly", anomalyZoneBinder);
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    anomalyZoneBinder.spawnedArtefactsCount = 3;
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    anomalyZoneBinder.artefactWaysByArtefactId.set(521, "sect_1");
    anomalyZoneBinder.artefactWaysByArtefactId.set(522, "sect_2");
    anomalyZoneBinder.artefactWaysByArtefactId.set(523, "sect_3");
    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays([]);

    mockServerAlifeObject({ id: 521, section_name: <T>() => "sect_1" as T });
    mockServerAlifeObject({ id: 523, section_name: <T>() => "sect_3" as T });

    expect(getAnomalyArtefacts("another-anomaly")).toEqualLuaArrays(["sect_1", "sect_3"]);
  });
});
