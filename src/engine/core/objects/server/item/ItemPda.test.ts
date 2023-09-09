import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemPda } from "@/engine/core/objects/server/item/ItemPda";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemPda server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemPda: ItemPda = new ItemPda("test-section");

    expect(itemPda.section_name()).toBe("test-section");
    expect(itemPda.keep_saved_data_anyway()).toBe(false);
    expect(itemPda.can_switch_online()).toBe(true);

    itemPda.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemPda.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemPda: ItemPda = new ItemPda("test-section");

    expect(itemPda.section_name()).toBe("test-section");
    expect(itemPda.keep_saved_data_anyway()).toBe(false);
    expect(itemPda.can_switch_online()).toBe(true);
    expect(itemPda.isSecretItem).toBe(false);

    itemPda.isSecretItem = true;

    expect(itemPda.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemPda: ItemPda = new ItemPda("test-section");

    jest.spyOn(itemPda, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemPda.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemPda);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemPda.id);
    expect(getStoryIdByObjectId(itemPda.id)).toBe("test-story-id");

    itemPda.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemPda: ItemPda = new ItemPda("test-section");

    const onItemPdaRegister = jest.fn();
    const onItemPdaUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_PDA_REGISTERED, onItemPdaRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_PDA_UNREGISTERED, onItemPdaUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemPda.on_register();

    expect(onItemPdaRegister).toHaveBeenCalledWith(itemPda);
    expect(onItemPdaUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemPda);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemPda.on_unregister();

    expect(onItemPdaRegister).toHaveBeenCalledWith(itemPda);
    expect(onItemPdaUnregister).toHaveBeenCalledWith(itemPda);
    expect(onItemRegister).toHaveBeenCalledWith(itemPda);
    expect(onItemUnregister).toHaveBeenCalledWith(itemPda);
  });
});
