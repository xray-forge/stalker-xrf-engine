import { describe, expect, it } from "@jest/globals";

import { AnomalyFieldBinder } from "@/engine/core/binders/zones/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import {
  registerAnomalyField,
  registerAnomalyZone,
  unregisterAnomalyField,
  unregisterAnomalyZone,
} from "@/engine/core/database/anomalies";
import { registry } from "@/engine/core/database/registry";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("anomaly zones module of the database", () => {
  it("should correctly register anomaly zones", () => {
    const object: GameObject = MockGameObject.mock();
    const anomalyZone: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    registerAnomalyZone(anomalyZone);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(object.id())).toEqual({ object });
    expect(registry.anomalyZones.length()).toBe(1);
    expect(registry.anomalyZones.get(object.name())).toBe(anomalyZone);
    expect(registry.zones.length()).toBe(1);
    expect(registry.zones.get(object.name())).toBe(object);

    unregisterAnomalyZone(anomalyZone);

    expect(registry.objects.length()).toBe(0);
    expect(registry.anomalyZones.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
  });
});

describe("anomaly fields module of the database", () => {
  it("should correctly register anomaly fields", () => {
    const object: GameObject = MockGameObject.mock();
    const anomalyField: AnomalyFieldBinder = new AnomalyFieldBinder(object);

    registerAnomalyField(anomalyField);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(object.id())).toEqual({ object });
    expect(registry.anomalyFields.length()).toBe(1);
    expect(registry.anomalyFields.get(object.name())).toBe(anomalyField);

    unregisterAnomalyField(anomalyField);

    expect(registry.objects.length()).toBe(0);
    expect(registry.anomalyFields.length()).toBe(0);
  });
});
