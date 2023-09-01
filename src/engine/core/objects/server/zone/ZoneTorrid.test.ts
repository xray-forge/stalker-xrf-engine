import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ZoneTorrid } from "@/engine/core/objects/server/zone/ZoneTorrid";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ZoneTorrid server class", () => {
  it("should correctly create generic objects without story links", () => {
    const zoneTorrid: ZoneTorrid = new ZoneTorrid("test-section");

    expect(zoneTorrid.section_name()).toBe("test-section");
    expect(zoneTorrid.keep_saved_data_anyway()).toBe(false);
    expect(zoneTorrid.can_switch_online()).toBe(true);

    zoneTorrid.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    zoneTorrid.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const zoneTorrid: ZoneTorrid = new ZoneTorrid("test-section");

    jest.spyOn(zoneTorrid, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    zoneTorrid.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(zoneTorrid);
    expect(getObjectIdByStoryId("test-story-id")).toBe(zoneTorrid.id);
    expect(getStoryIdByObjectId(zoneTorrid.id)).toBe("test-story-id");

    zoneTorrid.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
