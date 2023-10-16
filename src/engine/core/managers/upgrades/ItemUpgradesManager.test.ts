import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { ItemUpgradesManager } from "@/engine/core/managers/upgrades/ItemUpgradesManager";
import { resetRegistry } from "@/fixtures/engine";

describe("ItemUpgradesManager class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize and destroy", () => {
    const upgradesManager: ItemUpgradesManager = getManagerInstance(ItemUpgradesManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(3);

    disposeManager(ItemUpgradesManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });
  it.todo("should correctly set hints");

  it.todo("should correctly get repair prices");

  it.todo("should correctly get repair payment");

  it.todo("should correctly get possibilities label");

  it.todo("should correctly check if item can be upgraded");

  it.todo("should correctly set price discounts");

  it.todo("should correctly check if able to repair item");

  it.todo("should correctly generate ask repair replics");

  it.todo("should correctly get pre-condition functor A");

  it.todo("should correctly get pre-requirement functor A");

  it.todo("should correctly handle effect A");

  it.todo("should correctly get property functor A");

  it.todo("should correctly get property functor B");

  it.todo("should correctly get property functor C");

  it.todo("should correctly issue properties");
});
