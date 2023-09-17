import { describe, expect, it, jest } from "@jest/globals";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ObjectHangingLamp } from "@/engine/core/objects/server/physic/ObjectHangingLamp";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ObjectHangingLamp server class", () => {
  it("should correctly create generic objects without story links", () => {
    const objectHangingLamp: ObjectHangingLamp = new ObjectHangingLamp("test-section");

    expect(objectHangingLamp.section_name()).toBe("test-section");
    expect(objectHangingLamp.keep_saved_data_anyway()).toBe(true);
    expect(objectHangingLamp.can_switch_online()).toBe(true);

    objectHangingLamp.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    objectHangingLamp.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should not switch online if is in secret", () => {
    const objectHangingLamp: ObjectHangingLamp = new ObjectHangingLamp("test-section");

    expect(objectHangingLamp.section_name()).toBe("test-section");
    expect(objectHangingLamp.keep_saved_data_anyway()).toBe(true);
    expect(objectHangingLamp.can_switch_online()).toBe(true);
    expect(objectHangingLamp.isSecretItem).toBe(false);

    objectHangingLamp.isSecretItem = true;

    expect(objectHangingLamp.can_switch_online()).toBe(false);
  });

  it("should correctly create generic objects with story links", () => {
    const objectHangingLamp: ObjectHangingLamp = new ObjectHangingLamp("test-section");

    jest.spyOn(objectHangingLamp, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    objectHangingLamp.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(objectHangingLamp);
    expect(getObjectIdByStoryId("test-story-id")).toBe(objectHangingLamp.id);
    expect(getStoryIdByObjectId(objectHangingLamp.id)).toBe("test-story-id");

    objectHangingLamp.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const object: ObjectHangingLamp = new ObjectHangingLamp("test-section");

    const obObjectRegister = jest.fn();
    const onObjectUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.OBJECT_HANGING_LAMP_REGISTER, obObjectRegister);
    eventsManager.registerCallback(EGameEvent.OBJECT_HANGING_LAMP_UNREGISTER, onObjectUnregister);

    object.on_register();

    expect(obObjectRegister).toHaveBeenCalledWith(object);
    expect(onObjectUnregister).not.toHaveBeenCalled();

    object.on_unregister();

    expect(obObjectRegister).toHaveBeenCalledWith(object);
    expect(onObjectUnregister).toHaveBeenCalledWith(object);
  });
});
