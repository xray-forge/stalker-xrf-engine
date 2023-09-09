import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
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

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const zoneTorrid: ZoneTorrid = new ZoneTorrid("test-section");

    const onTorridRegister = jest.fn();
    const onTorridUnregister = jest.fn();
    const onZoneRegister = jest.fn();
    const onZoneUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.TORRID_ZONE_REGISTERED, onTorridRegister);
    eventsManager.registerCallback(EGameEvent.TORRID_ZONE_UNREGISTERED, onTorridUnregister);

    eventsManager.registerCallback(EGameEvent.ZONE_REGISTERED, onZoneRegister);
    eventsManager.registerCallback(EGameEvent.ZONE_UNREGISTERED, onZoneUnregister);

    zoneTorrid.on_register();

    expect(onTorridRegister).toHaveBeenCalledWith(zoneTorrid);
    expect(onTorridUnregister).not.toHaveBeenCalled();
    expect(onZoneRegister).toHaveBeenCalledWith(zoneTorrid);
    expect(onZoneUnregister).not.toHaveBeenCalled();

    zoneTorrid.on_unregister();

    expect(onTorridRegister).toHaveBeenCalledWith(zoneTorrid);
    expect(onTorridUnregister).toHaveBeenCalledWith(zoneTorrid);
    expect(onZoneRegister).toHaveBeenCalledWith(zoneTorrid);
    expect(onZoneUnregister).toHaveBeenCalledWith(zoneTorrid);
  });
});
