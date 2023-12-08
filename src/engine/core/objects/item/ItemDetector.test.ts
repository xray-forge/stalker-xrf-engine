import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemDetector } from "@/engine/core/objects/item/ItemDetector";
import { resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemDetector server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create generic objects without story links", () => {
    const itemDetector: ItemDetector = new ItemDetector("test-section");

    expect(itemDetector.section_name()).toBe("test-section");
    expect(itemDetector.keep_saved_data_anyway()).toBe(false);
    expect(itemDetector.can_switch_online()).toBe(true);

    itemDetector.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemDetector.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemDetector: ItemDetector = new ItemDetector("test-section");

    expect(itemDetector.section_name()).toBe("test-section");
    expect(itemDetector.keep_saved_data_anyway()).toBe(false);
    expect(itemDetector.can_switch_online()).toBe(true);
    expect(itemDetector.isSecretItem).toBe(false);

    itemDetector.isSecretItem = true;

    expect(itemDetector.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemDetector: ItemDetector = new ItemDetector("test-section");

    jest.spyOn(itemDetector, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemDetector.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemDetector);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemDetector.id);
    expect(getStoryIdByObjectId(itemDetector.id)).toBe("test-story-id");

    itemDetector.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemDetector: ItemDetector = new ItemDetector("test-section");

    const onItemDetectorRegister = jest.fn();
    const onItemDetectorUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_DETECTOR_REGISTERED, onItemDetectorRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_DETECTOR_UNREGISTERED, onItemDetectorUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemDetector.on_register();

    expect(onItemDetectorRegister).toHaveBeenCalledWith(itemDetector);
    expect(onItemDetectorUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemDetector);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemDetector.on_unregister();

    expect(onItemDetectorRegister).toHaveBeenCalledWith(itemDetector);
    expect(onItemDetectorUnregister).toHaveBeenCalledWith(itemDetector);
    expect(onItemRegister).toHaveBeenCalledWith(itemDetector);
    expect(onItemUnregister).toHaveBeenCalledWith(itemDetector);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemDetector: ItemDetector = new ItemDetector("test-section");

    itemDetector.on_spawn();

    expect(registry.dynamicData.objects.has(itemDetector.id)).toBe(true);
  });
});
