import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { Helicopter } from "@/engine/core/objects/server/Helicopter";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("Helicopter server class", () => {
  it("should correctly create generic objects without story links", () => {
    const helicopter: Helicopter = new Helicopter("test-section");

    expect(helicopter.section_name()).toBe("test-section");
    expect(helicopter.keep_saved_data_anyway()).toBe(true);

    helicopter.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    helicopter.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const helicopter: Helicopter = new Helicopter("test-section");

    jest.spyOn(helicopter, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    helicopter.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(helicopter);
    expect(getObjectIdByStoryId("test-story-id")).toBe(helicopter.id);
    expect(getStoryIdByObjectId(helicopter.id)).toBe("test-story-id");

    helicopter.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });
});
