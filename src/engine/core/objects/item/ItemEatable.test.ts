import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getManager,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemEatable } from "@/engine/core/objects/item/ItemEatable";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemEatable server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    expect(itemEatable.section_name()).toBe("test-section");
    expect(itemEatable.keep_saved_data_anyway()).toBe(false);
    expect(itemEatable.can_switch_online()).toBe(true);

    itemEatable.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemEatable.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    expect(itemEatable.section_name()).toBe("test-section");
    expect(itemEatable.keep_saved_data_anyway()).toBe(false);
    expect(itemEatable.can_switch_online()).toBe(true);
    expect(itemEatable.isSecretItem).toBe(false);

    itemEatable.isSecretItem = true;

    expect(itemEatable.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    jest.spyOn(itemEatable, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemEatable.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemEatable);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemEatable.id);
    expect(getStoryIdByObjectId(itemEatable.id)).toBe("test-story-id");

    itemEatable.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    const onItemEatableRegister = jest.fn();
    const onItemEatableUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_EATABLE_REGISTERED, onItemEatableRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_EATABLE_UNREGISTERED, onItemEatableUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemEatable.on_register();

    expect(onItemEatableRegister).toHaveBeenCalledWith(itemEatable);
    expect(onItemEatableUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemEatable);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemEatable.on_unregister();

    expect(onItemEatableRegister).toHaveBeenCalledWith(itemEatable);
    expect(onItemEatableUnregister).toHaveBeenCalledWith(itemEatable);
    expect(onItemRegister).toHaveBeenCalledWith(itemEatable);
    expect(onItemUnregister).toHaveBeenCalledWith(itemEatable);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    itemEatable.on_spawn();

    expect(registry.dynamicData.objects.has(itemEatable.id)).toBe(true);
  });
});
