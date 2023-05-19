import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { Item } from "@/engine/core/objects/server/item/Item";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("Item server class", () => {
  it("should correctly create generic objects without story links", () => {
    const item: Item = new Item("test-section");

    expect(item.section_name()).toBe("test-section");
    expect(item.keep_saved_data_anyway()).toBe(false);
    expect(item.can_switch_online()).toBe(true);

    item.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    item.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const item: Item = new Item("test-section");

    expect(item.section_name()).toBe("test-section");
    expect(item.keep_saved_data_anyway()).toBe(false);
    expect(item.can_switch_online()).toBe(true);
    expect(item.isSecretItem).toBe(false);

    item.isSecretItem = true;

    expect(item.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const item: Item = new Item("test-section");

    jest.spyOn(item, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    item.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(item);
    expect(getObjectIdByStoryId("test-story-id")).toBe(item.id);
    expect(getStoryIdByObjectId(item.id)).toBe("test-story-id");

    item.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
