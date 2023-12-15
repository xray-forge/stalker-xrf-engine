import { beforeEach, describe, expect, it } from "@jest/globals";

import { AnomalyFieldBinder } from "@/engine/core/binders/zones/AnomalyFieldBinder";
import { registry } from "@/engine/core/database";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockGameObject, MockObjectBinder } from "@/fixtures/xray";

describe("AnomalyFieldBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyFieldBinder = new AnomalyFieldBinder(object);

    binder.reinit();

    expect(registry.objects.get(object.id()).object).toBe(object);
  });

  it("should correctly handle going online and offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const binder: AnomalyFieldBinder = new AnomalyFieldBinder(object);

    expect(registry.anomalyFields.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);

    binder.net_spawn(serverObject);

    expect(registry.anomalyFields.length()).toBe(1);
    expect(registry.anomalyFields.get(object.name())).toBe(binder);
    expect(registry.zones.length()).toBe(1);
    expect(registry.zones.get(object.name())).toBe(object);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(object.id()).object).toBe(object);

    binder.net_destroy();

    expect(registry.anomalyFields.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online and offline when check to spawn is falsy", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const binder: AnomalyFieldBinder = new AnomalyFieldBinder(object);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(serverObject);

    expect(registry.anomalyFields.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should be net save relevant", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyFieldBinder = new AnomalyFieldBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle disable/enable", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: AnomalyFieldBinder = new AnomalyFieldBinder(object);

    binder.setEnabled(true);
    expect(object.enable_anomaly).toHaveBeenCalledTimes(1);

    binder.setEnabled(false);
    expect(object.disable_anomaly).toHaveBeenCalledTimes(1);
  });
});
