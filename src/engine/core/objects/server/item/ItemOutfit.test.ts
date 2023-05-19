import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemOutfit } from "@/engine/core/objects/server/item/ItemOutfit";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemOutfit server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    expect(itemOutfit.section_name()).toBe("test-section");
    expect(itemOutfit.keep_saved_data_anyway()).toBe(false);
    expect(itemOutfit.can_switch_online()).toBe(true);

    itemOutfit.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemOutfit.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    expect(itemOutfit.section_name()).toBe("test-section");
    expect(itemOutfit.keep_saved_data_anyway()).toBe(false);
    expect(itemOutfit.can_switch_online()).toBe(true);
    expect(itemOutfit.isSecretItem).toBe(false);

    itemOutfit.isSecretItem = true;

    expect(itemOutfit.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemOutfit: ItemOutfit = new ItemOutfit("test-section");

    jest.spyOn(itemOutfit, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemOutfit.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemOutfit);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemOutfit.id);
    expect(getStoryIdByObjectId(itemOutfit.id)).toBe("test-story-id");

    itemOutfit.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
