import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeaponMagazined } from "@/engine/core/objects/item/ItemWeaponMagazined";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponMagazined server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    expect(itemWeaponMagazined.section_name()).toBe("test-section");
    expect(itemWeaponMagazined.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazined.can_switch_online()).toBe(true);

    itemWeaponMagazined.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponMagazined.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    expect(itemWeaponMagazined.section_name()).toBe("test-section");
    expect(itemWeaponMagazined.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazined.can_switch_online()).toBe(true);
    expect(itemWeaponMagazined.isSecretItem).toBe(false);

    itemWeaponMagazined.isSecretItem = true;

    expect(itemWeaponMagazined.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    jest.spyOn(itemWeaponMagazined, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponMagazined.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponMagazined);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponMagazined.id);
    expect(getStoryIdByObjectId(itemWeaponMagazined.id)).toBe("test-story-id");

    itemWeaponMagazined.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    const onItemWeaponMagazinedRegister = jest.fn();
    const onItemWeaponMagazinedUnregister = jest.fn();
    const onItemWeaponRegister = jest.fn();
    const onItemWeaponUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_MAGAZINED_REGISTERED, onItemWeaponMagazinedRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_MAGAZINED_UNREGISTERED, onItemWeaponMagazinedUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_REGISTERED, onItemWeaponRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_UNREGISTERED, onItemWeaponUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemWeaponMagazined.on_register();

    expect(onItemWeaponMagazinedRegister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemWeaponMagazinedUnregister).not.toHaveBeenCalled();
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemWeaponUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemWeaponMagazined.on_unregister();

    expect(onItemWeaponMagazinedRegister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemWeaponMagazinedUnregister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemWeaponUnregister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponMagazined);
    expect(onItemUnregister).toHaveBeenCalledWith(itemWeaponMagazined);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    itemWeaponMagazined.on_spawn();

    expect(registry.dynamicData.objects.has(itemWeaponMagazined.id)).toBe(true);
  });
});
