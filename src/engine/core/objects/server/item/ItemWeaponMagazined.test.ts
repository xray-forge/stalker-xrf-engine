import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemWeaponMagazined } from "@/engine/core/objects/server/item/ItemWeaponMagazined";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponMagazined server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    expect(itemWeaponMagazined.section_name()).toBe("test-section");
    expect(itemWeaponMagazined.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazined.can_switch_online()).toBe(true);

    itemWeaponMagazined.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponMagazined.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    expect(itemWeaponMagazined.section_name()).toBe("test-section");
    expect(itemWeaponMagazined.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponMagazined.can_switch_online()).toBe(true);
    expect(itemWeaponMagazined.isSecretItem).toBe(false);

    itemWeaponMagazined.isSecretItem = true;

    expect(itemWeaponMagazined.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponMagazined: ItemWeaponMagazined = new ItemWeaponMagazined("test-section");

    jest.spyOn(itemWeaponMagazined, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponMagazined.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponMagazined);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponMagazined.id);
    expect(getStoryIdByObjectId(itemWeaponMagazined.id)).toBe("test-story-id");

    itemWeaponMagazined.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
