import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemExplosive } from "@/engine/core/objects/server/item/ItemExplosive";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemExplosive server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemExplosive: ItemExplosive = new ItemExplosive("test-section");

    expect(itemExplosive.section_name()).toBe("test-section");
    expect(itemExplosive.keep_saved_data_anyway()).toBe(false);
    expect(itemExplosive.can_switch_online()).toBe(true);

    itemExplosive.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemExplosive.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemExplosive: ItemExplosive = new ItemExplosive("test-section");

    expect(itemExplosive.section_name()).toBe("test-section");
    expect(itemExplosive.keep_saved_data_anyway()).toBe(false);
    expect(itemExplosive.can_switch_online()).toBe(true);
    expect(itemExplosive.isSecretItem).toBe(false);

    itemExplosive.isSecretItem = true;

    expect(itemExplosive.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemExplosive: ItemExplosive = new ItemExplosive("test-section");

    jest.spyOn(itemExplosive, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemExplosive.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemExplosive);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemExplosive.id);
    expect(getStoryIdByObjectId(itemExplosive.id)).toBe("test-story-id");

    itemExplosive.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
