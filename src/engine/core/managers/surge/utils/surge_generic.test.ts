import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { launchSurgeSignalRockets } from "@/engine/core/managers/surge/utils/surge_generic";
import { SignalLightBinder } from "@/engine/core/objects/binders";
import { mockRegisteredActor } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("surge_generic utils", () => {
  beforeEach(() => {
    mockRegisteredActor();
  });

  it("launchSurgeSignalRockets should correctly launch rockets", () => {
    const first: SignalLightBinder = new SignalLightBinder(mockClientGameObject());
    const second: SignalLightBinder = new SignalLightBinder(mockClientGameObject());

    first.reinit();
    second.reinit();

    jest.spyOn(first, "launch");
    jest.spyOn(second, "launch");

    expect(first.isFlying()).toBe(false);
    expect(second.isFlying()).toBe(false);

    launchSurgeSignalRockets();

    expect(first.isFlying()).toBe(true);
    expect(second.isFlying()).toBe(true);

    expect(first.launch).toHaveBeenCalledTimes(1);
    expect(first.launch).toHaveBeenCalledTimes(1);

    launchSurgeSignalRockets();

    expect(first.launch).toHaveBeenCalledTimes(1);
    expect(first.launch).toHaveBeenCalledTimes(1);
  });
});
