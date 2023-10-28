import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemAmmo } from "@/engine/core/objects/item/ItemAmmo";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemAmmo server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemAmmo: ItemAmmo = new ItemAmmo("test-section");

    expect(itemAmmo.section_name()).toBe("test-section");
    expect(itemAmmo.keep_saved_data_anyway()).toBe(false);
    expect(itemAmmo.can_switch_online()).toBe(true);

    itemAmmo.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemAmmo.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemAmmo: ItemAmmo = new ItemAmmo("test-section");

    expect(itemAmmo.section_name()).toBe("test-section");
    expect(itemAmmo.keep_saved_data_anyway()).toBe(false);
    expect(itemAmmo.can_switch_online()).toBe(true);
    expect(itemAmmo.isSecretItem).toBe(false);

    itemAmmo.isSecretItem = true;

    expect(itemAmmo.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemAmmo: ItemAmmo = new ItemAmmo("test-section");

    jest.spyOn(itemAmmo, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemAmmo.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemAmmo);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemAmmo.id);
    expect(getStoryIdByObjectId(itemAmmo.id)).toBe("test-story-id");

    itemAmmo.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemAmmo: ItemAmmo = new ItemAmmo("test-section");

    const onItemAmmoRegister = jest.fn();
    const onItemAmmoUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_AMMO_REGISTERED, onItemAmmoRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_AMMO_UNREGISTERED, onItemAmmoUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemAmmo.on_register();

    expect(onItemAmmoRegister).toHaveBeenCalledWith(itemAmmo);
    expect(onItemAmmoUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemAmmo);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemAmmo.on_unregister();

    expect(onItemAmmoRegister).toHaveBeenCalledWith(itemAmmo);
    expect(onItemAmmoUnregister).toHaveBeenCalledWith(itemAmmo);
    expect(onItemRegister).toHaveBeenCalledWith(itemAmmo);
    expect(onItemUnregister).toHaveBeenCalledWith(itemAmmo);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemAmmo: ItemAmmo = new ItemAmmo("test-section");

    itemAmmo.on_spawn();

    expect(registry.dynamicData.objects.has(itemAmmo.id)).toBe(true);
  });
});
