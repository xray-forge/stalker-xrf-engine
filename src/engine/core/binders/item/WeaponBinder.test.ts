import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { WeaponBinder } from "@/engine/core/binders/item/WeaponBinder";
import { getManager, IRegistryObjectState, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeapon } from "@/engine/core/objects/item/ItemWeapon";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockObjectBinder, mockServerAlifeObject } from "@/fixtures/xray";

describe("WeaponBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly handle going online/offline and release", () => {
    const binder: WeaponBinder = new WeaponBinder(MockGameObject.mock());
    const serverObject: ItemWeapon = mockServerAlifeObject({
      id: binder.object.id(),
    }) as ItemWeapon;

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(0);

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(1);
    expect(registry.dynamicData.objects.length()).toBe(1);

    const previous: IRegistryObjectState = registry.objects.get(binder.object.id());

    binder.reinit();

    expect(registry.objects.get(binder.object.id())).not.toBe(previous);

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(1);

    binder.net_Relcase(binder.object);

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(0);
  });

  it("should correctly handle going online/offline when check to spawn is falsy", () => {
    const binder: WeaponBinder = new WeaponBinder(MockGameObject.mock());
    const serverObject: ItemWeapon = mockServerAlifeObject({
      id: binder.object.id(),
    }) as ItemWeapon;

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(0);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(0);
  });

  it("should correctly emit lifecycle signals", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const binder: WeaponBinder = new WeaponBinder(MockGameObject.mock());

    const onGoOnlineFirstTime = jest.fn();
    const onGoOnline = jest.fn();
    const onGoOffline = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, onGoOnlineFirstTime);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_GO_ONLINE, onGoOnline);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_GO_OFFLINE, onGoOffline);

    binder.net_spawn(
      mockServerAlifeObject({
        id: binder.object.id(),
      }) as ItemWeapon
    );

    expect(onGoOnlineFirstTime).toHaveBeenCalledWith(binder.object, binder);
    expect(onGoOnline).toHaveBeenCalledWith(binder.object, binder);
    expect(onGoOffline).not.toHaveBeenCalled();

    binder.net_destroy();

    expect(onGoOnlineFirstTime).toHaveBeenCalledTimes(1);
    expect(onGoOnline).toHaveBeenCalledTimes(1);
    expect(onGoOffline).toHaveBeenCalledTimes(1);
    expect(onGoOffline).toHaveBeenCalledWith(binder.object, binder);

    binder.net_spawn(
      mockServerAlifeObject({
        id: binder.object.id(),
      }) as ItemWeapon
    );

    expect(onGoOnlineFirstTime).toHaveBeenCalledTimes(1);
    expect(onGoOnline).toHaveBeenCalledTimes(2);
    expect(onGoOffline).toHaveBeenCalledTimes(1);
  });
});
