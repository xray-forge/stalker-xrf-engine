import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, registerActor, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  ENotificationDirection,
  ENotificationType,
  IItemRelocatedNotification,
  IMoneyRelocatedNotification,
} from "@/engine/core/managers/notifications";
import {
  giveItemsToActor,
  giveMoneyToActor,
  takeItemFromActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GameObject, TCount, TSection } from "@/engine/lib/types";
import { createObjectWithItems, resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "@/fixtures/xray";

function getItemsCount(object: GameObject, section: TSection): TCount {
  return [...((object as unknown as MockGameObject).objectInventory as Map<number, GameObject>).entries()].filter(
    ([, it]) => {
      return it.section() === section;
    }
  ).length;
}

describe("giveMoneyToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should correctly transfer money", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    const mock = jest.fn((notification: IMoneyRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.MONEY);
      expect(notification.amount).toBe(250);
      expect(notification.direction).toBe(ENotificationDirection.IN);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    giveMoneyToActor(250);

    expect(registry.actor.give_money).toHaveBeenCalledWith(250);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("takeMoneyFromActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should correctly transfer money", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    const mock = jest.fn((notification: IMoneyRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.MONEY);
      expect(notification.amount).toBe(500);
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    const destinationObject: GameObject = MockGameObject.mock();

    transferMoneyFromActor(destinationObject, 500);

    expect(registry.actor.transfer_money).toHaveBeenCalledWith(500, destinationObject);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("transferItemsFromActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should take items from actor", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(2);
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    registerActor(createObjectWithItems());

    expect(getItemsCount(registry.actor, weapons.wpn_svd)).toBe(2);
    expect(getItemsCount(registry.actor, medkits.medkit)).toBe(2);
    expect(getItemsCount(registry.actor, medkits.medkit_army)).toBe(3);
    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(6);

    transferItemsFromActor(MockGameObject.mock(), weapons.wpn_svd, 2);

    expect(getItemsCount(registry.actor, weapons.wpn_svd)).toBe(0);
    expect(getItemsCount(registry.actor, medkits.medkit)).toBe(2);
    expect(getItemsCount(registry.actor, medkits.medkit_army)).toBe(3);
    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(6);

    expect(registry.actor.transfer_item).toHaveBeenCalledTimes(2);

    expect(() => transferItemsFromActor(MockGameObject.mock(), weapons.wpn_svd, 2)).toThrow();
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("should take ammo from object", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(90);
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    registerActor(createObjectWithItems());

    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(6);
    transferItemsFromActor(MockGameObject.mock(), ammo.ammo_9x18_pmm, 3);
    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(3);
    expect(registry.actor.transfer_item).toHaveBeenCalledTimes(3);

    transferItemsFromActor(MockGameObject.mock(), ammo.ammo_9x18_pmm, 3);
    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(0);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("should take ALL from object", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(180);
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    registerActor(createObjectWithItems());

    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(6);

    transferItemsFromActor(MockGameObject.mock(), ammo.ammo_9x18_pmm, "all");

    expect(getItemsCount(registry.actor, ammo.ammo_9x18_pmm)).toBe(0);
    expect(registry.actor.transfer_item).toHaveBeenCalledTimes(6);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("should fail on bad attempts", () => {
    registerActor(createObjectWithItems());

    const to: GameObject = MockGameObject.mock();

    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], -1)).toThrow();
    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], 0)).toThrow();
    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], 1)).toThrow();
    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], 10)).toThrow();
    expect(() => transferItemsFromActor(to, weapons.wpn_svd, 10)).toThrow();
  });
});

describe("transferItemsToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should take items from object", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const from: GameObject = createObjectWithItems();
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(180);
      expect(notification.direction).toBe(ENotificationDirection.IN);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    expect(getItemsCount(from, ammo.ammo_9x18_pmm)).toBe(6);
    transferItemsToActor(from, ammo.ammo_9x18_pmm, 6);
    expect(getItemsCount(from, ammo.ammo_9x18_pmm)).toBe(0);
    expect(from.transfer_item).toHaveBeenCalledTimes(6);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("giveItemsToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should correctly create items and then notify", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(300);
      expect(notification.direction).toBe(ENotificationDirection.IN);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    giveItemsToActor("ammo_5.45x39_ap", 300);

    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("giveItemsToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should correctly create items and then notify", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(300);
      expect(notification.direction).toBe(ENotificationDirection.IN);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    giveItemsToActor("ammo_5.45x39_ap", 300);

    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("takeItemFromActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  it("should correctly delete items and then notify", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemToTake: GameObject = MockGameObject.mock();
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.itemSection).toBe("test_section");
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    expect(() => takeItemFromActor("test_section_none")).toThrow();

    MockAlifeSimulator.addToRegistry(MockAlifeObject.mock({ id: itemToTake.id() }));

    expect(registry.simulator.object(itemToTake.id())).not.toBeNull();

    const actor: GameObject = MockGameObject.mockActor();

    jest.spyOn(actor, "object").mockImplementation(() => itemToTake);

    registerActor(actor);
    takeItemFromActor("test_section");

    expect(registry.simulator.object(itemToTake.id())).toBeNull();
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
