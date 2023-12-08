import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { OutfitBinder } from "@/engine/core/binders/item/OutfitBinder";
import { getManager, IRegistryObjectState, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ServerItemHelmetObject, ServerItemOutfitObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("HelmetBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly handle going online/offline and release", () => {
    const binder: OutfitBinder = new OutfitBinder(MockGameObject.mock());
    const serverObject: ServerItemHelmetObject = mockServerAlifeObject({
      id: binder.object.id(),
    }) as ServerItemHelmetObject;

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

  it("should correctly emit lifecycle signals", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const binder: OutfitBinder = new OutfitBinder(MockGameObject.mock());

    const onGoOnlineFirstTime = jest.fn();
    const onGoOnline = jest.fn();
    const onGoOffline = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_GO_ONLINE_FIRST_TIME, onGoOnlineFirstTime);
    eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_GO_ONLINE, onGoOnline);
    eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_GO_OFFLINE, onGoOffline);

    binder.net_spawn(
      mockServerAlifeObject({
        id: binder.object.id(),
      }) as ServerItemOutfitObject
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
      }) as ServerItemOutfitObject
    );

    expect(onGoOnlineFirstTime).toHaveBeenCalledTimes(1);
    expect(onGoOnline).toHaveBeenCalledTimes(2);
    expect(onGoOffline).toHaveBeenCalledTimes(1);
  });
});
