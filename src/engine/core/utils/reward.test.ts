import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, registerActor, registerSimulator, registry } from "@/engine/core/database";
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
import { AnyObject, GameObject, TSection } from "@/engine/lib/types";
import { MockAlifeSimulator, MockGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("reward utils", () => {
  const createObjectWithItems = () =>
    MockGameObject.mock({
      inventory: [
        [1, MockGameObject.mock({ sectionOverride: medkits.medkit } as Partial<GameObject>)],
        [2, MockGameObject.mock({ sectionOverride: medkits.medkit } as Partial<GameObject>)],
        [3, MockGameObject.mock({ sectionOverride: medkits.medkit_army } as Partial<GameObject>)],
        [4, MockGameObject.mock({ sectionOverride: medkits.medkit_army } as Partial<GameObject>)],
        [5, MockGameObject.mock({ sectionOverride: medkits.medkit_army } as Partial<GameObject>)],
        [40, MockGameObject.mock({ sectionOverride: weapons.wpn_svd } as Partial<GameObject>)],
        [41, MockGameObject.mock({ sectionOverride: weapons.wpn_svd } as Partial<GameObject>)],
        [50, MockGameObject.mock({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [51, MockGameObject.mock({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [52, MockGameObject.mock({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [53, MockGameObject.mock({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [54, MockGameObject.mock({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [55, MockGameObject.mock({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
      ],
    });

  const getItemsCount = (object: GameObject, section: TSection) => {
    return [...((object as AnyObject).inventory as Map<number, GameObject>).entries()].filter(([, it]) => {
      return it.section() === section;
    }).length;
  };

  beforeEach(() => {
    registerActor(MockGameObject.mockActor());
    registerSimulator();
  });

  afterEach(() => {
    disposeManager(EventsManager);
  });

  it("giveMoneyToActor should correctly transfer money", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();

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

  it("takeMoneyFromActor should correctly transfer money", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();

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

  it("transferItemsFromActor should take items from actor", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
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

  it("transferItemsFromActor should take ammo from object", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
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

  it("transferItemsFromActor should take ALL from object", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
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

  it("transferItemsFromActor should fail on bad attempts", () => {
    registerActor(createObjectWithItems());

    const to: GameObject = MockGameObject.mock();

    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], -1)).toThrow();
    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], 0)).toThrow();
    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], 1)).toThrow();
    expect(() => transferItemsFromActor(to, ammo["ammo_5.45x39_ap"], 10)).toThrow();
    expect(() => transferItemsFromActor(to, weapons.wpn_svd, 10)).toThrow();
  });

  it("transferItemsToActor should take items from object", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
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

  it("giveItemsToActor should correctly create items and then notify", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.amount).toBe(300);
      expect(notification.direction).toBe(ENotificationDirection.IN);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    giveItemsToActor("ammo_5.45x39_ap", 300);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("takeItemFromActor should correctly delete items and then notify", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemToTake: GameObject = MockGameObject.mock();
    const mock = jest.fn((notification: IItemRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.ITEM);
      expect(notification.itemSection).toBe("test_section");
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock);

    expect(() => takeItemFromActor("test_section_none")).toThrow();

    MockAlifeSimulator.addToRegistry(mockServerAlifeObject({ id: itemToTake.id() }));

    expect(registry.simulator.object(itemToTake.id())).not.toBeNull();

    registerActor(MockGameObject.mock({ object: () => itemToTake }));
    takeItemFromActor("test_section");

    expect(registry.simulator.object(itemToTake.id())).toBeNull();
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
