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
import { ItemWeaponMagazinedWGl } from "@/engine/core/objects/item/ItemWeaponMagazinedWGl";
import { resetRegistry } from "@/fixtures/engine";
import { MockIniFile } from "@/fixtures/xray";

describe("ItemWeaponMagazinedWGl", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    expect(itemWeaponMagazinedWGl.section_name()).toBe("test-section");
    expect(itemWeaponMagazinedWGl.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazinedWGl.can_switch_online()).toBe(true);

    itemWeaponMagazinedWGl.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponMagazinedWGl.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    expect(itemWeaponMagazinedWGl.section_name()).toBe("test-section");
    expect(itemWeaponMagazinedWGl.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazinedWGl.can_switch_online()).toBe(true);
    expect(itemWeaponMagazinedWGl.isSecretItem).toBe(false);

    itemWeaponMagazinedWGl.isSecretItem = true;

    expect(itemWeaponMagazinedWGl.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    jest.spyOn(itemWeaponMagazinedWGl, "spawn_ini").mockReturnValue(
      MockIniFile.mock("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponMagazinedWGl.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponMagazinedWGl);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponMagazinedWGl.id);
    expect(getStoryIdByObjectId(itemWeaponMagazinedWGl.id)).toBe("test-story-id");

    itemWeaponMagazinedWGl.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    const onItemWeaponMagazinedRegister = jest.fn();
    const onItemWeaponMagazinedUnregister = jest.fn();
    const onItemWeaponRegister = jest.fn();
    const onItemWeaponUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_MAGAZINED_WGL_REGISTERED, onItemWeaponMagazinedRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_MAGAZINED_WGL_UNREGISTERED, onItemWeaponMagazinedUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_REGISTERED, onItemWeaponRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_UNREGISTERED, onItemWeaponUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemWeaponMagazinedWGl.on_register();

    expect(onItemWeaponMagazinedRegister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemWeaponMagazinedUnregister).not.toHaveBeenCalled();
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemWeaponUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemWeaponMagazinedWGl.on_unregister();

    expect(onItemWeaponMagazinedRegister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemWeaponMagazinedUnregister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemWeaponUnregister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
    expect(onItemUnregister).toHaveBeenCalledWith(itemWeaponMagazinedWGl);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    itemWeaponMagazinedWGl.on_spawn();

    expect(registry.dynamicData.objects.has(itemWeaponMagazinedWGl.id)).toBe(true);
  });
});
