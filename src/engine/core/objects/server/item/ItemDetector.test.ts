import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemDetector } from "@/engine/core/objects/server/item/ItemDetector";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemDetector server class", () => {
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
});
