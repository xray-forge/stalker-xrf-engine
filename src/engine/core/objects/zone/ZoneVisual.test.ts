import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ZoneVisual } from "@/engine/core/objects/zone/ZoneVisual";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ZoneVisual server class", () => {
  beforeEach(() => registerSimulator());

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

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const zoneVisual: ZoneVisual = new ZoneVisual("test-section");

    const onRestrictorRegister = jest.fn();
    const onRestrictorUnregister = jest.fn();
    const onZoneRegister = jest.fn();
    const onZoneUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.VISUAL_ZONE_REGISTERED, onRestrictorRegister);
    eventsManager.registerCallback(EGameEvent.VISUAL_ZONE_UNREGISTERED, onRestrictorUnregister);

    eventsManager.registerCallback(EGameEvent.ZONE_REGISTERED, onZoneRegister);
    eventsManager.registerCallback(EGameEvent.ZONE_UNREGISTERED, onZoneUnregister);

    zoneVisual.on_register();

    expect(onRestrictorRegister).toHaveBeenCalledWith(zoneVisual);
    expect(onRestrictorUnregister).not.toHaveBeenCalled();
    expect(onZoneRegister).toHaveBeenCalledWith(zoneVisual);
    expect(onZoneUnregister).not.toHaveBeenCalled();

    zoneVisual.on_unregister();

    expect(onRestrictorRegister).toHaveBeenCalledWith(zoneVisual);
    expect(onRestrictorUnregister).toHaveBeenCalledWith(zoneVisual);
    expect(onZoneRegister).toHaveBeenCalledWith(zoneVisual);
    expect(onZoneUnregister).toHaveBeenCalledWith(zoneVisual);
  });
});
