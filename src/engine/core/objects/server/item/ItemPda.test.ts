import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
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
});
