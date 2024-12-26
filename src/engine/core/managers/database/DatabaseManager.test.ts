import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManager } from "@/engine/core/database";
import { DatabaseManager } from "@/engine/core/managers/database/DatabaseManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AnyObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";

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

  it("should correctly dump event", () => {
    const manager: DatabaseManager = getManager(DatabaseManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ DatabaseManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ DatabaseManager: expect.any(Object) });
  });
});
