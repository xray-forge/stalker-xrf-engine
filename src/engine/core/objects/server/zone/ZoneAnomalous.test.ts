import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ZoneAnomalous } from "@/engine/core/objects/server/zone";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ZoneAnomalous server class", () => {
  it("should correctly create generic objects without story links", () => {
    const zoneAnomalous: ZoneAnomalous = new ZoneAnomalous("test-section");

    expect(zoneAnomalous.section_name()).toBe("test-section");
    expect(zoneAnomalous.keep_saved_data_anyway()).toBe(false);
    expect(zoneAnomalous.can_switch_online()).toBe(true);

    zoneAnomalous.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    zoneAnomalous.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const zoneAnomalous: ZoneAnomalous = new ZoneAnomalous("test-section");

    jest.spyOn(zoneAnomalous, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    zoneAnomalous.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(zoneAnomalous);
    expect(getObjectIdByStoryId("test-story-id")).toBe(zoneAnomalous.id);
    expect(getStoryIdByObjectId(zoneAnomalous.id)).toBe("test-story-id");

    zoneAnomalous.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
