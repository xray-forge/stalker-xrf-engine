import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ItemWeaponAutomaticShotgun } from "@/engine/core/objects/server/item/ItemWeaponAutomaticShotgun";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemWeaponAutomaticShotgun server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    expect(itemWeaponAutomaticShotgun.section_name()).toBe("test-section");
    expect(itemWeaponAutomaticShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponAutomaticShotgun.can_switch_online()).toBe(true);

    itemWeaponAutomaticShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemWeaponAutomaticShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    expect(itemWeaponAutomaticShotgun.section_name()).toBe("test-section");
    expect(itemWeaponAutomaticShotgun.keep_saved_data_anyway()).toBe(false);
    expect(itemWeaponAutomaticShotgun.can_switch_online()).toBe(true);
    expect(itemWeaponAutomaticShotgun.isSecretItem).toBe(false);

    itemWeaponAutomaticShotgun.isSecretItem = true;

    expect(itemWeaponAutomaticShotgun.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const itemWeaponAutomaticShotgun: ItemWeaponAutomaticShotgun = new ItemWeaponAutomaticShotgun("test-section");

    jest.spyOn(itemWeaponAutomaticShotgun, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemWeaponAutomaticShotgun.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemWeaponAutomaticShotgun);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemWeaponAutomaticShotgun.id);
    expect(getStoryIdByObjectId(itemWeaponAutomaticShotgun.id)).toBe("test-story-id");

    itemWeaponAutomaticShotgun.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
