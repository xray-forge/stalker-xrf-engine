import { beforeEach, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { disposeManager, getManager, registerObject, registerSimulationObject } from "@/engine/core/database";
import { DatabaseManager } from "@/engine/core/managers/database/DatabaseManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

describe("DatabaseManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    getManager(DatabaseManager);

    expect(eventsManager.getSubscribersCount()).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);

    disposeManager(DatabaseManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle debug dump event", () => {
    const object = MockGameObject.mock();
    const objectState = registerObject(object);
    const terrain = MockSmartTerrain.mock();

    registerSimulationObject(terrain);

    const manager: DatabaseManager = getManager(DatabaseManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    const dump: AnyObject = data.DatabaseManager;

    expect(data).toEqual({ DatabaseManager: expect.any(Object) });
    expect(dump.maxObjectId).toBe(object.id());
    expect(dump.objectsCount).toBe(1);
    expect(dump.objects.get(`${object.id()}#${object.name()}`)).toBe(objectState);
    expect(dump.simulationObjectsCount).toBe(1);
    expect(dump.simulationObjects.get(1)).toBe(`${terrain.id}#${terrain.name()}`);
    expect(dump.smartTerrainsCount).toBe(0);
    expect(dump.cachedIniCount).toBe(0);
    expect(dump.saveMarkersCount).toBe(0);
    expect(manager.onDebugDump({})).toEqual({ DatabaseManager: expect.any(Object) });
  });
});
