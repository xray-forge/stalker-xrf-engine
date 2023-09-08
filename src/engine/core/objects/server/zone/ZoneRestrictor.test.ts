import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ZoneRestrictor } from "@/engine/core/objects/server/zone/ZoneRestrictor";
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

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const zoneRestrictor: ZoneRestrictor = new ZoneRestrictor("test-section");

    const onRestrictorRegister = jest.fn();
    const onRestrictorUnregister = jest.fn();
    const onZoneRegister = jest.fn();
    const onZoneUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.RESTRICTOR_REGISTERED, onRestrictorRegister);
    eventsManager.registerCallback(EGameEvent.RESTRICTOR_UNREGISTERED, onRestrictorUnregister);

    eventsManager.registerCallback(EGameEvent.ZONE_REGISTERED, onZoneRegister);
    eventsManager.registerCallback(EGameEvent.ZONE_UNREGISTERED, onZoneUnregister);

    zoneRestrictor.on_register();

    expect(onRestrictorRegister).toHaveBeenCalledWith(zoneRestrictor);
    expect(onRestrictorUnregister).not.toHaveBeenCalled();
    expect(onZoneRegister).toHaveBeenCalledWith(zoneRestrictor);
    expect(onZoneUnregister).not.toHaveBeenCalled();

    zoneRestrictor.on_unregister();

    expect(onRestrictorRegister).toHaveBeenCalledWith(zoneRestrictor);
    expect(onRestrictorUnregister).toHaveBeenCalledWith(zoneRestrictor);
    expect(onZoneRegister).toHaveBeenCalledWith(zoneRestrictor);
    expect(onZoneUnregister).toHaveBeenCalledWith(zoneRestrictor);
  });
});
