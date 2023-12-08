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
import { LevelChanger } from "@/engine/core/objects/LevelChanger";
import { EPacketDataType, mockIniFile, mockNetPacket, MockNetProcessor } from "@/fixtures/xray";

describe("LevelChanger server class", () => {
  beforeEach(() => registerSimulator());

  it("should correctly create generic objects without story links", () => {
    const levelChanger: LevelChanger = new LevelChanger("test-section");

    expect(levelChanger.isEnabled).toBe(true);
    expect(levelChanger.invitationHint).toBe("level_changer_invitation");

    expect(levelChanger.section_name()).toBe("test-section");

    levelChanger.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    levelChanger.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const levelChanger: LevelChanger = new LevelChanger("test-section");

    jest.spyOn(levelChanger, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    levelChanger.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(levelChanger);
    expect(getObjectIdByStoryId("test-story-id")).toBe(levelChanger.id);
    expect(getStoryIdByObjectId(levelChanger.id)).toBe("test-story-id");

    levelChanger.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly save and load data", () => {
    const levelChanger: LevelChanger = new LevelChanger("test-section");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    levelChanger.isEnabled = false;
    levelChanger.invitationHint = "another";

    levelChanger.STATE_Write(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["LevelChanger", false, "another", 2]);

    const anotherLevelChanger: LevelChanger = new LevelChanger("test-section");

    anotherLevelChanger.STATE_Read(mockNetPacket(netProcessor), -1);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toEqual([]);

    expect(anotherLevelChanger.isEnabled).toBe(false);
    expect(anotherLevelChanger.invitationHint).toBe("another");
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const levelChanger: LevelChanger = new LevelChanger("test-section");

    const onLevelChangerRegister = jest.fn();
    const onLevelChangerUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.LEVEL_CHANGER_REGISTERED, onLevelChangerRegister);
    eventsManager.registerCallback(EGameEvent.LEVEL_CHANGER_UNREGISTERED, onLevelChangerUnregister);

    levelChanger.on_register();

    expect(onLevelChangerRegister).toHaveBeenCalledWith(levelChanger);
    expect(onLevelChangerUnregister).not.toHaveBeenCalled();

    levelChanger.on_unregister();

    expect(onLevelChangerRegister).toHaveBeenCalledWith(levelChanger);
    expect(onLevelChangerUnregister).toHaveBeenCalledWith(levelChanger);
  });
});
