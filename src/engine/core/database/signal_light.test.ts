import { beforeEach, describe, expect, it } from "@jest/globals";

import { SignalLightBinder } from "@/engine/core/binders/physic/SignalLightBinder";
import { registry } from "@/engine/core/database/registry";
import { registerSignalLight, unregisterSignalLight } from "@/engine/core/database/signal_light";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("registerSignalLight util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly register objects", () => {
    const first: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const second: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    expect(registry.objects.length()).toBe(0);
    expect(registry.signalLights.length()).toBe(0);

    registerSignalLight(first);

    expect(registry.objects.length()).toBe(1);
    expect(registry.signalLights.length()).toBe(1);

    registerSignalLight(second);

    expect(registry.objects.length()).toBe(2);
    expect(registry.signalLights.length()).toBe(2);

    expect(registry.signalLights.get(first.object.name())).toBe(first);
    expect(registry.signalLights.get(second.object.name())).toBe(second);
  });
});

describe("unregisterSignalLight util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly register objects", () => {
    const first: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const second: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    registerSignalLight(first);
    registerSignalLight(second);

    expect(registry.objects.length()).toBe(2);
    expect(registry.signalLights.length()).toBe(2);

    unregisterSignalLight(first);

    expect(registry.objects.length()).toBe(1);
    expect(registry.signalLights.length()).toBe(1);

    unregisterSignalLight(second);
    unregisterSignalLight(first);

    expect(registry.objects.length()).toBe(0);
    expect(registry.signalLights.length()).toBe(0);
  });
});
