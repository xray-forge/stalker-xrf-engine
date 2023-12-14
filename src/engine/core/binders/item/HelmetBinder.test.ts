import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { HelmetBinder } from "@/engine/core/binders/item/HelmetBinder";
import { getManager, IRegistryObjectState, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemHelmet } from "@/engine/core/objects/item/ItemHelmet";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockObjectBinder, mockServerAlifeObject } from "@/fixtures/xray";

describe("HelmetBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly handle going online/offline and release", () => {
    const binder: HelmetBinder = new HelmetBinder(MockGameObject.mock());
    const serverObject: ItemHelmet = mockServerAlifeObject({
      id: binder.object.id(),
    }) as ItemHelmet;

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
    const binder: HelmetBinder = new HelmetBinder(MockGameObject.mock());
    const serverObject: ItemHelmet = mockServerAlifeObject({
      id: binder.object.id(),
    }) as ItemHelmet;

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(0);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(0);
    expect(registry.dynamicData.objects.length()).toBe(0);
  });

  it("should correctly emit lifecycle signals", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const binder: HelmetBinder = new HelmetBinder(MockGameObject.mock());

    const onGoOnlineFirstTime = jest.fn();
    const onGoOnline = jest.fn();
    const onGoOffline = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_HELMET_GO_ONLINE_FIRST_TIME, onGoOnlineFirstTime);
    eventsManager.registerCallback(EGameEvent.ITEM_HELMET_GO_ONLINE, onGoOnline);
    eventsManager.registerCallback(EGameEvent.ITEM_HELMET_GO_OFFLINE, onGoOffline);

    binder.net_spawn(
      mockServerAlifeObject({
        id: binder.object.id(),
      }) as ItemHelmet
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
      }) as ItemHelmet
    );

    expect(onGoOnlineFirstTime).toHaveBeenCalledTimes(1);
    expect(onGoOnline).toHaveBeenCalledTimes(2);
    expect(onGoOffline).toHaveBeenCalledTimes(1);
  });
});
