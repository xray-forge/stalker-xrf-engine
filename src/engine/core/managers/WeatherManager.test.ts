import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { EventsManager, WeatherManager } from "@/engine/core/managers";

describe("WeatherManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize and destroy", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(weatherManager.last_hour).toBe(0);
    expect(weatherManager.wfx_time).toBe(0);
    expect(eventsManager.getSubscribersCount()).toBe(2);

    disposeManager(WeatherManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });
});
