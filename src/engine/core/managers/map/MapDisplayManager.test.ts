import { describe, expect, it, jest } from "@jest/globals";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import {
  updateAnomalyZonesDisplay,
  updateSleepZonesDisplay,
  updateTerrainsMapSpotDisplay,
} from "@/engine/core/managers/map/utils";
import { AnyObject } from "@/engine/lib/types";

jest.mock("@/engine/core/managers/map/utils");

describe("MapDisplayManager", () => {
  it("should correctly handle init and destroy events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    getManager(MapDisplayManager);

    expect(eventsManager.getSubscribersCount()).toBe(3);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE_5000)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.STALKER_DEATH)).toBe(1);

    disposeManager(MapDisplayManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle update event with init", () => {
    const manager: MapDisplayManager = getManager(MapDisplayManager);

    expect(manager.isInitialized).toBe(false);

    jest.spyOn(Date, "now").mockImplementation(() => 60_000);

    manager.update();

    expect(manager.isInitialized).toBe(true);

    expect(updateAnomalyZonesDisplay).toHaveBeenCalledTimes(1);
    expect(updateSleepZonesDisplay).toHaveBeenCalledTimes(1);
    expect(updateTerrainsMapSpotDisplay).toHaveBeenCalledTimes(1);

    manager.update();

    expect(updateAnomalyZonesDisplay).toHaveBeenCalledTimes(1);
    expect(updateSleepZonesDisplay).toHaveBeenCalledTimes(2);
    expect(updateTerrainsMapSpotDisplay).toHaveBeenCalledTimes(2);
  });

  it("should correctly handle debug dump event", () => {
    const manager: MapDisplayManager = getManager(MapDisplayManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ MapDisplayManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ MapDisplayManager: expect.any(Object) });
  });
});
