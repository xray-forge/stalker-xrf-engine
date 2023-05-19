import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ZoneVisual } from "@/engine/core/objects";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ZoneVisual server class", () => {
  it("should correctly create generic objects without story links", () => {
    const zoneVisual: ZoneVisual = new ZoneVisual("test-section");

    expect(zoneVisual.section_name()).toBe("test-section");
    expect(zoneVisual.keep_saved_data_anyway()).toBe(false);
    expect(zoneVisual.can_switch_online()).toBe(true);

    zoneVisual.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    zoneVisual.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const zoneVisual: ZoneVisual = new ZoneVisual("test-section");

    jest.spyOn(zoneVisual, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    zoneVisual.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(zoneVisual);
    expect(getObjectIdByStoryId("test-story-id")).toBe(zoneVisual.id);
    expect(getStoryIdByObjectId(zoneVisual.id)).toBe("test-story-id");

    zoneVisual.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
