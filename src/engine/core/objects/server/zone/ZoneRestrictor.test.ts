import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { ZoneRestrictor } from "@/engine/core/objects";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ZoneRestrictor server class", () => {
  it("should correctly create generic objects without story links", () => {
    const zoneRestrictor: ZoneRestrictor = new ZoneRestrictor("test-section");

    expect(zoneRestrictor.section_name()).toBe("test-section");
    expect(zoneRestrictor.keep_saved_data_anyway()).toBe(true);
    expect(zoneRestrictor.can_switch_online()).toBe(true);

    zoneRestrictor.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    zoneRestrictor.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const zoneRestrictor: ZoneRestrictor = new ZoneRestrictor("test-section");

    jest.spyOn(zoneRestrictor, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    zoneRestrictor.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(zoneRestrictor);
    expect(getObjectIdByStoryId("test-story-id")).toBe(zoneRestrictor.id);
    expect(getStoryIdByObjectId(zoneRestrictor.id)).toBe("test-story-id");

    zoneRestrictor.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
