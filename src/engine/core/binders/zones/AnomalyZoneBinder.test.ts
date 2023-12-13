import { beforeEach, describe, expect, it } from "@jest/globals";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registry } from "@/engine/core/database";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockGameObject } from "@/fixtures/xray";

describe("AnomalyZoneBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);
  });

  it("should correctly handle going online and offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
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

  it("should be net save relevant", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyZoneBinder = new AnomalyZoneBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });

  it.todo("should correctly handle save/load");

  it.todo("should correctly handle turn on/turn off");

  it.todo("should correctly handle disabling anomaly fields");

  it.todo("should correctly handle respawn artefacts and changing anomalies layouts");

  it.todo("should correctly spawn random artefacts");

  it.todo("should correctly handle artefact paths");

  it.todo("should correctly handle forced spawn");

  it.todo("should correctly handle update event");

  it.todo("should correctly handle artefact taking");

  it.todo("should correctly get artefacts lists for section");
});
