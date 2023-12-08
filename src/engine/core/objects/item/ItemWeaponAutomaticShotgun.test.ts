import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeaponAutomaticShotgun } from "@/engine/core/objects/item/ItemWeaponAutomaticShotgun";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponAutomaticShotgun server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    expect(itemWeaponAutomaticShotgun.section_name()).toBe("test-section");
    expect(itemWeaponAutomaticShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponAutomaticShotgun.can_switch_online()).toBe(true);

    itemWeaponAutomaticShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponAutomaticShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    expect(itemWeaponAutomaticShotgun.section_name()).toBe("test-section");
    expect(itemWeaponAutomaticShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponAutomaticShotgun.can_switch_online()).toBe(true);
    expect(itemWeaponAutomaticShotgun.isSecretItem).toBe(false);

    itemWeaponAutomaticShotgun.isSecretItem = true;

    expect(itemWeaponAutomaticShotgun.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    jest.spyOn(itemWeaponAutomaticShotgun, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponAutomaticShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponAutomaticShotgun);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponAutomaticShotgun.id);
    expect(getStoryIdByObjectId(itemWeaponAutomaticShotgun.id)).toBe("test-story-id");

    itemWeaponAutomaticShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    const onItemAutoShotgunRegister = jest.fn();
    const onItemAutoShotgunUnregister = jest.fn();
    const onItemWeaponRegister = jest.fn();
    const onItemWeaponUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_AUTOMATIC_SHOTGUN_REGISTERED, onItemAutoShotgunRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_AUTOMATIC_SHOTGUN_UNREGISTERED, onItemAutoShotgunUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_REGISTERED, onItemWeaponRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_UNREGISTERED, onItemWeaponUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemWeaponAutomaticShotgun.on_register();

    expect(onItemAutoShotgunRegister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemAutoShotgunUnregister).not.toHaveBeenCalled();
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemWeaponUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemWeaponAutomaticShotgun.on_unregister();

    expect(onItemAutoShotgunRegister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemAutoShotgunUnregister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemWeaponRegister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemWeaponUnregister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemRegister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
    expect(onItemUnregister).toHaveBeenCalledWith(itemWeaponAutomaticShotgun);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    itemWeaponAutomaticShotgun.on_spawn();

    expect(registry.dynamicData.objects.has(itemWeaponAutomaticShotgun.id)).toBe(true);
  });
});
