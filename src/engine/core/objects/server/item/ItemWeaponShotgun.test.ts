import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemWeaponShotgun } from "@/engine/core/objects/server/item/ItemWeaponShotgun";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponShotgun server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    expect(itemWeaponShotgun.section_name()).toBe("test-section");
    expect(itemWeaponShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponShotgun.can_switch_online()).toBe(true);

    itemWeaponShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    expect(itemWeaponShotgun.section_name()).toBe("test-section");
    expect(itemWeaponShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponShotgun.can_switch_online()).toBe(true);
    expect(itemWeaponShotgun.isSecretItem).toBe(false);

    itemWeaponShotgun.isSecretItem = true;

    expect(itemWeaponShotgun.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponShotgun: ItemWeaponShotgun = new ItemWeaponShotgun("test-section");

    jest.spyOn(itemWeaponShotgun, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponShotgun);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponShotgun.id);
    expect(getStoryIdByObjectId(itemWeaponShotgun.id)).toBe("test-story-id");

    itemWeaponShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
