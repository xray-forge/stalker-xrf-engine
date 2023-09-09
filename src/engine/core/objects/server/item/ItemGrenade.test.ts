import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemGrenade } from "@/engine/core/objects/server/item/ItemGrenade";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemGrenade server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemGrenade: ItemGrenade = new ItemGrenade("test-section");

    expect(itemGrenade.section_name()).toBe("test-section");
    expect(itemGrenade.keep_saved_data_anyway()).toBe(false);
    expect(itemGrenade.can_switch_online()).toBe(true);

    itemGrenade.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemGrenade.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemGrenade: ItemGrenade = new ItemGrenade("test-section");

    expect(itemGrenade.section_name()).toBe("test-section");
    expect(itemGrenade.keep_saved_data_anyway()).toBe(false);
    expect(itemGrenade.can_switch_online()).toBe(true);
    expect(itemGrenade.isSecretItem).toBe(false);

    itemGrenade.isSecretItem = true;

    expect(itemGrenade.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemGrenade: ItemGrenade = new ItemGrenade("test-section");

    jest.spyOn(itemGrenade, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemGrenade.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemGrenade);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemGrenade.id);
    expect(getStoryIdByObjectId(itemGrenade.id)).toBe("test-story-id");

    itemGrenade.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemExplosive: ItemGrenade = new ItemGrenade("test-section");

    const onItemGrenadeRegister = jest.fn();
    const onItemGrenadeUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_GRENADE_REGISTERED, onItemGrenadeRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_GRENADE_UNREGISTERED, onItemGrenadeUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemExplosive.on_register();

    expect(onItemGrenadeRegister).toHaveBeenCalledWith(itemExplosive);
    expect(onItemGrenadeUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemExplosive);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemExplosive.on_unregister();

    expect(onItemGrenadeRegister).toHaveBeenCalledWith(itemExplosive);
    expect(onItemGrenadeUnregister).toHaveBeenCalledWith(itemExplosive);
    expect(onItemRegister).toHaveBeenCalledWith(itemExplosive);
    expect(onItemUnregister).toHaveBeenCalledWith(itemExplosive);
  });
});
