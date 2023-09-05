import { describe, expect, it } from "@jest/globals";

import {
  registerAnomalyField,
  registerAnomalyZone,
  unregisterAnomalyField,
  unregisterAnomalyZone,
} from "@/engine/core/database/anomalies";
import { registry } from "@/engine/core/database/registry";
import { AnomalyFieldBinder, AnomalyZoneBinder } from "@/engine/core/objects/binders/zones";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'anomalies' module of the database", () => {
  it("should correctly register anomaly zones", () => {
    expect(registry.actor).toBeNull();

    const anomalyZone: AnomalyZoneBinder = new AnomalyZoneBinder(mockClientGameObject());

    registerAnomalyZone(anomalyZone);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(anomalyZone.object.id())).toEqual({ object: anomalyZone.object });
    expect(registry.anomalyZones.length()).toBe(1);
    expect(registry.anomalyZones.get(anomalyZone.object.name())).toBe(anomalyZone);

    unregisterAnomalyZone(anomalyZone);

    expect(registry.objects.length()).toBe(0);
    expect(registry.anomalyZones.length()).toBe(0);
  });

  it("should correctly register anomaly fields", () => {
    expect(registry.actor).toBeNull();

    const anomalyField: AnomalyFieldBinder = new AnomalyFieldBinder(mockClientGameObject());

    registerAnomalyField(anomalyField);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(anomalyField.object.id())).toEqual({ object: anomalyField.object });
    expect(registry.anomalyFields.length()).toBe(1);
    expect(registry.anomalyFields.get(anomalyField.object.name())).toBe(anomalyField);

    unregisterAnomalyField(anomalyField);

    expect(registry.objects.length()).toBe(0);
    expect(registry.anomalyFields.length()).toBe(0);
  });
});
