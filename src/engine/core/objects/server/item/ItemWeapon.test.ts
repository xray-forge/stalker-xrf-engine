import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeapon } from "@/engine/core/objects/server/item/ItemWeapon";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeapon server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemWeapon: ItemWeapon = new ItemWeapon("test-section");

    expect(itemWeapon.section_name()).toBe("test-section");
    expect(itemWeapon.keep_saved_data_anyway()).toBe(false);
    expect(itemWeapon.can_switch_online()).toBe(true);

    itemWeapon.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeapon.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeapon: ItemWeapon = new ItemWeapon("test-section");

    expect(itemWeapon.section_name()).toBe("test-section");
    expect(itemWeapon.keep_saved_data_anyway()).toBe(false);
    expect(itemWeapon.can_switch_online()).toBe(true);
    expect(itemWeapon.isSecretItem).toBe(false);

    itemWeapon.isSecretItem = true;

    expect(itemWeapon.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeapon: ItemWeapon = new ItemWeapon("test-section");

    jest.spyOn(itemWeapon, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeapon.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeapon);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeapon.id);
    expect(getStoryIdByObjectId(itemWeapon.id)).toBe("test-story-id");

    itemWeapon.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemWeapon: ItemWeapon = new ItemWeapon("test-section");

    const onItemTorchRegister = jest.fn();
    const onItemTorchUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_REGISTERED, onItemTorchRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_UNREGISTERED, onItemTorchUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemWeapon.on_register();

    expect(onItemTorchRegister).toHaveBeenCalledWith(itemWeapon);
    expect(onItemTorchUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemWeapon);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemWeapon.on_unregister();

    expect(onItemTorchRegister).toHaveBeenCalledWith(itemWeapon);
    expect(onItemTorchUnregister).toHaveBeenCalledWith(itemWeapon);
    expect(onItemRegister).toHaveBeenCalledWith(itemWeapon);
    expect(onItemUnregister).toHaveBeenCalledWith(itemWeapon);
  });
});
