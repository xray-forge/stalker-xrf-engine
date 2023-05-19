import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemHelmet } from "@/engine/core/objects/server/item/ItemHelmet";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemHelmet server class", () => {
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
});
