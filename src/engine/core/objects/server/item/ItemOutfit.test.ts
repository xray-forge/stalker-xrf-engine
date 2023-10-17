import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemOutfit } from "@/engine/core/objects/server/item/ItemOutfit";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemOutfit server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    expect(itemOutfit.section_name()).toBe("test-section");
    expect(itemOutfit.keep_saved_data_anyway()).toBe(false);
    expect(itemOutfit.can_switch_online()).toBe(true);

    itemOutfit.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemOutfit.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    expect(itemOutfit.section_name()).toBe("test-section");
    expect(itemOutfit.keep_saved_data_anyway()).toBe(false);
    expect(itemOutfit.can_switch_online()).toBe(true);
    expect(itemOutfit.isSecretItem).toBe(false);

    itemOutfit.isSecretItem = true;

    expect(itemOutfit.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    jest.spyOn(itemOutfit, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemOutfit.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemOutfit);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemOutfit.id);
    expect(getStoryIdByObjectId(itemOutfit.id)).toBe("test-story-id");

    itemOutfit.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    const onItemOutfitRegister = jest.fn();
    const onItemOutfitUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_REGISTERED, onItemOutfitRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_UNREGISTERED, onItemOutfitUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemOutfit.on_register();

    expect(onItemOutfitRegister).toHaveBeenCalledWith(itemOutfit);
    expect(onItemOutfitUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemOutfit);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemOutfit.on_unregister();

    expect(onItemOutfitRegister).toHaveBeenCalledWith(itemOutfit);
    expect(onItemOutfitUnregister).toHaveBeenCalledWith(itemOutfit);
    expect(onItemRegister).toHaveBeenCalledWith(itemOutfit);
    expect(onItemUnregister).toHaveBeenCalledWith(itemOutfit);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    itemOutfit.on_spawn();

    expect(registry.dynamicData.objects.has(itemOutfit.id)).toBe(true);
  });
});
