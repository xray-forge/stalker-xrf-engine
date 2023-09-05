import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ObjectPhysic } from "@/engine/core/objects/server/physic/ObjectPhysic";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ObjectPhysic server class", () => {
  it("should correctly create generic objects without story links", () => {
    const objectPhysic: ObjectPhysic = new ObjectPhysic("test-section");

    expect(objectPhysic.section_name()).toBe("test-section");
    expect(objectPhysic.keep_saved_data_anyway()).toBe(true);
    expect(objectPhysic.can_switch_online()).toBe(true);

    objectPhysic.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    objectPhysic.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const objectPhysic: ObjectPhysic = new ObjectPhysic("test-section");

    expect(objectPhysic.section_name()).toBe("test-section");
    expect(objectPhysic.keep_saved_data_anyway()).toBe(true);
    expect(objectPhysic.can_switch_online()).toBe(true);
    expect(objectPhysic.isSecretItem).toBe(false);

    objectPhysic.isSecretItem = true;

    expect(objectPhysic.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const objectPhysic: ObjectPhysic = new ObjectPhysic("test-section");

    jest.spyOn(objectPhysic, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    objectPhysic.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(objectPhysic);
    expect(getObjectIdByStoryId("test-story-id")).toBe(objectPhysic.id);
    expect(getStoryIdByObjectId(objectPhysic.id)).toBe("test-story-id");

    objectPhysic.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
