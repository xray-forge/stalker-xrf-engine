import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemHelmet } from "@/engine/core/objects/server/item/ItemHelmet";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemHelmet server class", () => {
  beforeEach(() => registerSimulator());

  it("should correctly create generic objects without story links", () => {
    const itemHelmet: ItemHelmet = new ItemHelmet("test-section");

    expect(itemHelmet.section_name()).toBe("test-section");
    expect(itemHelmet.keep_saved_data_anyway()).toBe(false);
    expect(itemHelmet.can_switch_online()).toBe(true);

    itemHelmet.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemHelmet.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemHelmet: ItemHelmet = new ItemHelmet("test-section");

    expect(itemHelmet.section_name()).toBe("test-section");
    expect(itemHelmet.keep_saved_data_anyway()).toBe(false);
    expect(itemHelmet.can_switch_online()).toBe(true);
    expect(itemHelmet.isSecretItem).toBe(false);

    itemHelmet.isSecretItem = true;

    expect(itemHelmet.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemHelmet: ItemHelmet = new ItemHelmet("test-section");

    jest.spyOn(itemHelmet, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemHelmet.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemHelmet);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemHelmet.id);
    expect(getStoryIdByObjectId(itemHelmet.id)).toBe("test-story-id");

    itemHelmet.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const itemHelmet: ItemHelmet = new ItemHelmet("test-section");

    const onItemHelmetRegister = jest.fn();
    const onItemHelmetUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_HELMET_REGISTERED, onItemHelmetRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_HELMET_UNREGISTERED, onItemHelmetUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemHelmet.on_register();

    expect(onItemHelmetRegister).toHaveBeenCalledWith(itemHelmet);
    expect(onItemHelmetUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemHelmet);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemHelmet.on_unregister();

    expect(onItemHelmetRegister).toHaveBeenCalledWith(itemHelmet);
    expect(onItemHelmetUnregister).toHaveBeenCalledWith(itemHelmet);
    expect(onItemRegister).toHaveBeenCalledWith(itemHelmet);
    expect(onItemUnregister).toHaveBeenCalledWith(itemHelmet);
  });
});
