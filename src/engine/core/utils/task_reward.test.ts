import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { XR_game_object } from "xray16";

import { disposeManager, registerActor, registry } from "@/engine/core/database";
import {
  EGameEvent,
  ENotificationDirection,
  ENotificationType,
  EventsManager,
  IMoneyRelocatedNotification,
} from "@/engine/core/managers";
import {
  actorHasAtLeastOneItem,
  actorHasItem,
  actorHasItems,
  actorHasMedKit,
  getActorAvailableMedKit,
  getNpcSpeaker,
  giveMoneyToActor,
  isObjectName,
  npcHasItem,
  transferMoneyFromActor,
} from "@/engine/core/utils/task_reward";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { TNumberId, TSection } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'task_reward' utils", () => {
  const mockObjectWithItems = () =>
    mockClientGameObject({
      object: (section: TSection | TNumberId) => {
        const sectionsMap: Record<TSection, XR_game_object> = {
          a: mockClientGameObject(),
          b: mockClientGameObject(),
          [medkits.medkit]: mockClientGameObject(),
          [medkits.medkit_army]: mockClientGameObject(),
        };

        const idMap: Record<TNumberId, XR_game_object> = {
          1: mockClientGameObject(),
          2: mockClientGameObject(),
        };

        if (typeof section === "string") {
          return sectionsMap[section] || null;
        } else {
          return idMap[section] || null;
        }
      },
    } as Partial<XR_game_object>);

  beforeEach(() => {
    registerActor(mockClientGameObject());
  });

  afterEach(() => {
    disposeManager(EventsManager);
  });

  it("'giveMoneyToActor' should correctly transfer money", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();

    const mock = jest.fn((notification: IMoneyRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.MONEY);
      expect(notification.amount).toBe(250);
      expect(notification.direction).toBe(ENotificationDirection.IN);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock, null);

    giveMoneyToActor(250);

    expect(registry.actor.give_money).toHaveBeenCalledWith(250);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("'takeMoneyFromActor' should correctly transfer money", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();

    const mock = jest.fn((notification: IMoneyRelocatedNotification) => {
      expect(notification.type).toBe(ENotificationType.MONEY);
      expect(notification.amount).toBe(500);
      expect(notification.direction).toBe(ENotificationDirection.OUT);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, mock, null);

    const destinationObject: XR_game_object = mockClientGameObject();

    transferMoneyFromActor(destinationObject, 500);

    expect(registry.actor.transfer_money).toHaveBeenCalledWith(500, destinationObject);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("'getNpcSpeaker' should correctly pick speaker", () => {
    const first: XR_game_object = mockClientGameObject();
    const second: XR_game_object = mockClientGameObject();

    expect(getNpcSpeaker(registry.actor, first)).toBe(first);
    expect(getNpcSpeaker(registry.actor, second)).toBe(second);

    expect(getNpcSpeaker(first, registry.actor)).toBe(first);
    expect(getNpcSpeaker(second, registry.actor)).toBe(second);
  });

  it("'isObjectName' should correctly check name", () => {
    const object: XR_game_object = mockClientGameObject({ name: () => "test_complex_name" } as Partial<XR_game_object>);

    expect(object.name()).toBe("test_complex_name");
    expect(isObjectName(object, "another")).toBeFalsy();
    expect(isObjectName(object, "test_complex_name")).toBeTruthy();
    expect(isObjectName(object, "complex_name")).toBeTruthy();
    expect(isObjectName(object, "test_complex")).toBeTruthy();
    expect(isObjectName(object, "test")).toBeTruthy();
    expect(isObjectName(object, "complex")).toBeTruthy();
    expect(isObjectName(object, "name")).toBeTruthy();
  });

  it("'npcHasItem' should correctly check if object has item", () => {
    const object: XR_game_object = mockObjectWithItems();

    expect(npcHasItem(object, "a")).toBeTruthy();
    expect(npcHasItem(object, "b")).toBeTruthy();
    expect(npcHasItem(object, "c")).toBeFalsy();
    expect(npcHasItem(object, "d")).toBeFalsy();

    expect(npcHasItem(object, 1)).toBeTruthy();
    expect(npcHasItem(object, 2)).toBeTruthy();
    expect(npcHasItem(object, 3)).toBeFalsy();
    expect(npcHasItem(object, 4)).toBeFalsy();
  });

  it("'actorHasAtLeastOneItem' should correctly check if object has item", () => {
    registerActor(mockObjectWithItems());

    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray(["x", "y", "z"]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray(["x"]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray(["x", "y", "z", "a"]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray(["a"]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray(["a", "b"]))).toBeTruthy();

    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([58, 59, 60]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([45]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([58, 59, 60, 2]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([58, 59, 1, 60, 2]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([1]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([1, 2]))).toBeTruthy();

    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([1, 2, "a", "b"]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([5, 6, "a"]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray(["d", "c", 1]))).toBeTruthy();
  });

  it("'actorHasItems' should correctly check if object has items", () => {
    registerActor(mockObjectWithItems());

    expect(actorHasItems(MockLuaTable.mockFromArray(["x", "y", "z"]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray(["x"]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray(["x", "y", "z", "a"]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray(["a"]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray(["a", "b"]))).toBeTruthy();

    expect(actorHasItems(MockLuaTable.mockFromArray([58, 59, 60]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([45]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([58, 59, 60, 2]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([58, 59, 1, 60, 2]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([1]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([1, 2]))).toBeTruthy();

    expect(actorHasItems(MockLuaTable.mockFromArray([1, 2, "a", "b"]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([1, "a"]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([5, 6, "a"]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray(["d", "c", 1]))).toBeFalsy();
  });

  it("'actorHasItem' should correctly check if object has item", () => {
    registerActor(mockObjectWithItems());

    expect(actorHasItem("f")).toBeFalsy();
    expect(actorHasItem("e")).toBeFalsy();
    expect(actorHasItem("c")).toBeFalsy();
    expect(actorHasItem("a")).toBeTruthy();
    expect(actorHasItem("b")).toBeTruthy();

    expect(actorHasItem(1234)).toBeFalsy();
    expect(actorHasItem(123)).toBeFalsy();
    expect(actorHasItem(12)).toBeFalsy();
    expect(actorHasItem(1)).toBeTruthy();
    expect(actorHasItem(2)).toBeTruthy();
    expect(actorHasItem(3)).toBeFalsy();
    expect(actorHasItem(4)).toBeFalsy();
  });

  it("'actorHasMedKit' should correctly check if object has any medkit", () => {
    registerActor(mockObjectWithItems());

    expect(actorHasMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), mockClientGameObject())).toBeFalsy();

    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeFalsy();

    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit]), mockClientGameObject())).toBeFalsy();
  });

  it("'getActorAvailableMedKit' should correctly check medkit", () => {
    registerActor(mockObjectWithItems());

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBe(medkits.medkit);
    expect(
      getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), mockClientGameObject())
    ).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBe(medkits.medkit);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBe(medkits.medkit_army);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]), mockClientGameObject())).toBeNull();
  });

  it("'takeItemsFromActor' should take items from actor", () => {
    registerActor(mockObjectWithItems());

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBe(medkits.medkit);
    expect(
      getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), mockClientGameObject())
    ).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBe(medkits.medkit);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBe(medkits.medkit_army);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]), mockClientGameObject())).toBeNull();
  });
});
