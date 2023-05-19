import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
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
});
