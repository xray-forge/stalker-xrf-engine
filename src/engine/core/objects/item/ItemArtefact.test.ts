import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerActorServer,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Actor } from "@/engine/core/objects/creature";
import { ItemArtefact } from "@/engine/core/objects/item/ItemArtefact";
import { alifeConfig } from "@/engine/lib/configs/AlifeConfig";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("ItemArtefact server class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    registerActorServer(null as unknown as Actor);
  });

  it("should correctly create generic objects without story links", () => {
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    expect(itemArtefact.section_name()).toBe("test-section");
    expect(itemArtefact.keep_saved_data_anyway()).toBe(false);
    expect(itemArtefact.can_switch_online()).toBe(true);

    itemArtefact.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemArtefact.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    jest.spyOn(itemArtefact, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemArtefact.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemArtefact);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemArtefact.id);
    expect(getStoryIdByObjectId(itemArtefact.id)).toBe("test-story-id");

    itemArtefact.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should respect distance for offline switch", () => {
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    expect(itemArtefact.can_switch_offline()).toBe(true);

    const { actorServerObject } = mockRegisteredActor();

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementationOnce(() => alifeConfig.SWITCH_DISTANCE_SQR - 1)
      .mockImplementationOnce(() => alifeConfig.SWITCH_DISTANCE_SQR)
      .mockImplementationOnce(() => alifeConfig.SWITCH_DISTANCE_SQR + 1)
      .mockImplementationOnce(() => alifeConfig.SWITCH_DISTANCE_SQR + 1000);

    expect(itemArtefact.can_switch_offline()).toBe(false);
    expect(itemArtefact.can_switch_offline()).toBe(false);
    expect(itemArtefact.can_switch_offline()).toBe(true);
    expect(itemArtefact.can_switch_offline()).toBe(true);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    const onItemArtefactRegister = jest.fn();
    const onItemArtefactUnregister = jest.fn();
    const onItemRegister = jest.fn();
    const onItemUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ITEM_ARTEFACT_REGISTERED, onItemArtefactRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_ARTEFACT_UNREGISTERED, onItemArtefactUnregister);

    eventsManager.registerCallback(EGameEvent.ITEM_REGISTERED, onItemRegister);
    eventsManager.registerCallback(EGameEvent.ITEM_UNREGISTERED, onItemUnregister);

    itemArtefact.on_register();

    expect(onItemArtefactRegister).toHaveBeenCalledWith(itemArtefact);
    expect(onItemArtefactUnregister).not.toHaveBeenCalled();
    expect(onItemRegister).toHaveBeenCalledWith(itemArtefact);
    expect(onItemUnregister).not.toHaveBeenCalled();

    itemArtefact.on_unregister();

    expect(onItemArtefactRegister).toHaveBeenCalledWith(itemArtefact);
    expect(onItemArtefactUnregister).toHaveBeenCalledWith(itemArtefact);
    expect(onItemRegister).toHaveBeenCalledWith(itemArtefact);
    expect(onItemUnregister).toHaveBeenCalledWith(itemArtefact);
  });

  it("should correctly create dynamic state on spawn", () => {
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    itemArtefact.on_spawn();

    expect(registry.dynamicData.objects.has(itemArtefact.id)).toBe(true);
  });
});
