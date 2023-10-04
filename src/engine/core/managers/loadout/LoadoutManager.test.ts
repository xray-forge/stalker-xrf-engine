import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { LoadoutManager } from "@/engine/core/managers/loadout/LoadoutManager";
import { resetRegistry } from "@/fixtures/engine";

describe("LoadoutManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize/destroy", () => {
    const loadoutManager: LoadoutManager = getManagerInstance(LoadoutManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(1);

    disposeManager(LoadoutManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });
});
