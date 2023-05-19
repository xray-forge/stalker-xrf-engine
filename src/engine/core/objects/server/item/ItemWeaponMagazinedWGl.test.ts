import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemWeaponMagazinedWGl } from "@/engine/core/objects/server/item/ItemWeaponMagazinedWGl";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponMagazinedWGl server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    expect(itemWeaponMagazinedWGl.section_name()).toBe("test-section");
    expect(itemWeaponMagazinedWGl.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazinedWGl.can_switch_online()).toBe(true);

    itemWeaponMagazinedWGl.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponMagazinedWGl.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    expect(itemWeaponMagazinedWGl.section_name()).toBe("test-section");
    expect(itemWeaponMagazinedWGl.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazinedWGl.can_switch_online()).toBe(true);
    expect(itemWeaponMagazinedWGl.isSecretItem).toBe(false);

    itemWeaponMagazinedWGl.isSecretItem = true;

    expect(itemWeaponMagazinedWGl.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponMagazinedWGl: ItemWeaponMagazinedWGl = new ItemWeaponMagazinedWGl("test-section");

    jest.spyOn(itemWeaponMagazinedWGl, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponMagazinedWGl.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponMagazinedWGl);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponMagazinedWGl.id);
    expect(getStoryIdByObjectId(itemWeaponMagazinedWGl.id)).toBe("test-story-id");

    itemWeaponMagazinedWGl.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
