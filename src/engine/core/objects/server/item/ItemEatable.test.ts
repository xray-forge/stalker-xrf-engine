import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemEatable } from "@/engine/core/objects/server/item/ItemEatable";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemEatable server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    expect(itemEatable.section_name()).toBe("test-section");
    expect(itemEatable.keep_saved_data_anyway()).toBe(false);
    expect(itemEatable.can_switch_online()).toBe(true);

    itemEatable.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemEatable.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    expect(itemEatable.section_name()).toBe("test-section");
    expect(itemEatable.keep_saved_data_anyway()).toBe(false);
    expect(itemEatable.can_switch_online()).toBe(true);
    expect(itemEatable.isSecretItem).toBe(false);

    itemEatable.isSecretItem = true;

    expect(itemEatable.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemEatable: ItemEatable = new ItemEatable("test-section");

    jest.spyOn(itemEatable, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemEatable.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemEatable);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemEatable.id);
    expect(getStoryIdByObjectId(itemEatable.id)).toBe("test-story-id");

    itemEatable.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
