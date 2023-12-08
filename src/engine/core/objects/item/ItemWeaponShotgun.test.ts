import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeaponShotgun } from "@/engine/core/objects/item/ItemWeaponShotgun";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponShotgun server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    expect(itemWeaponShotgun.section_name()).toBe("test-section");
    expect(itemWeaponShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponShotgun.can_switch_online()).toBe(true);

    itemWeaponShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    expect(itemWeaponShotgun.section_name()).toBe("test-section");
    expect(itemWeaponShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponShotgun.can_switch_online()).toBe(true);
    expect(itemWeaponShotgun.isSecretItem).toBe(false);

    itemWeaponShotgun.isSecretItem = true;

    expect(itemWeaponShotgun.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    jest.spyOn(itemWeaponShotgun, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponShotgun);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponShotgun.id);
    expect(getStoryIdByObjectId(itemWeaponShotgun.id)).toBe("test-story-id");

    itemWeaponShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    const onItemWeaponShotgunRegister = jest.fn();
    const onItemWeaponShotgunUnregister = jest.fn();
    const onItemWeaponRegister = jest.fn();
    const onItemWeaponUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_SHOTGUN_REGISTERED, onItemWeaponShotgunRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_SHOTGUN_UNREGISTERED, onItemWeaponShotgunUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_REGISTERED, onItemWeaponRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_UNREGISTERED, onItemWeaponUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemWeaponShotgun.on_register();

    expect(onItemWeaponShotgunRegister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemWeaponShotgunUnregister).not.toHaveBeenCalled();
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemWeaponUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemWeaponShotgun.on_unregister();

    expect(onItemWeaponShotgunRegister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemWeaponShotgunUnregister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemWeaponUnregister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponShotgun);
    expect(onItemUnregister).toHaveBeenCalledWith(itemWeaponShotgun);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    itemWeaponShotgun.on_spawn();

    expect(registry.dynamicData.objects.has(itemWeaponShotgun.id)).toBe(true);
  });
});
