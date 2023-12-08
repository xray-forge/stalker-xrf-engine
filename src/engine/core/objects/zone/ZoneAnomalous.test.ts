import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getManager,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ZoneAnomalous } from "@/engine/core/objects/zone/index";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ZoneAnomalous server class", () => {
  beforeEach(() => registerSimulator());

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

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const zoneAnomalous: ZoneAnomalous = new ZoneAnomalous("test-section");

    const onAnomalousZoneRegister = jest.fn();
    const onAnomalousZoneUnregister = jest.fn();
    const onZoneRegister = jest.fn();
    const onZoneUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ANOMALOUS_ZONE_REGISTERED, onAnomalousZoneRegister);
    eventsManager.registerCallback(EGameEvent.ANOMALOUS_ZONE_UNREGISTERED, onAnomalousZoneUnregister);

    eventsManager.registerCallback(EGameEvent.ZONE_REGISTERED, onZoneRegister);
    eventsManager.registerCallback(EGameEvent.ZONE_UNREGISTERED, onZoneUnregister);

    zoneAnomalous.on_register();

    expect(onAnomalousZoneRegister).toHaveBeenCalledWith(zoneAnomalous);
    expect(onAnomalousZoneUnregister).not.toHaveBeenCalled();
    expect(onZoneRegister).toHaveBeenCalledWith(zoneAnomalous);
    expect(onZoneUnregister).not.toHaveBeenCalled();

    zoneAnomalous.on_unregister();

    expect(onAnomalousZoneRegister).toHaveBeenCalledWith(zoneAnomalous);
    expect(onAnomalousZoneUnregister).toHaveBeenCalledWith(zoneAnomalous);
    expect(onZoneRegister).toHaveBeenCalledWith(zoneAnomalous);
    expect(onZoneUnregister).toHaveBeenCalledWith(zoneAnomalous);
  });
});
