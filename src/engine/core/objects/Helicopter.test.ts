import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Helicopter } from "@/engine/core/objects/Helicopter";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("Helicopter server class", () => {
  beforeEach(() => registerSimulator());

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

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const helicopter: Helicopter = new Helicopter("test-section");

    const onHelicopterRegister = jest.fn();
    const onHelicopterUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.HELICOPTER_REGISTERED, onHelicopterRegister);
    eventsManager.registerCallback(EGameEvent.HELICOPTER_UNREGISTERED, onHelicopterUnregister);

    helicopter.on_register();

    expect(onHelicopterRegister).toHaveBeenCalledWith(helicopter);
    expect(onHelicopterUnregister).not.toHaveBeenCalled();

    helicopter.on_unregister();

    expect(onHelicopterRegister).toHaveBeenCalledWith(helicopter);
    expect(onHelicopterUnregister).toHaveBeenCalledWith(helicopter);
  });
});
