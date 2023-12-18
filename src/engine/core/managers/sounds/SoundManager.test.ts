import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { SCRIPT_SOUND_LTX, soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils";
import { NIL } from "@/engine/lib/constants/words";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

describe("SoundManager class", () => {
  beforeEach(() => {
    resetRegistry();

    soundsConfig.playing = new LuaTable();
    soundsConfig.themes = readIniThemesList(SCRIPT_SOUND_LTX);
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    getManager(SoundManager);

    expect(eventsManager.getSubscribersCount()).toBe(2);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_OFFLINE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);

    disposeManager(SoundManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle object updates with no sounds", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => getManager(SoundManager).update(object.id())).not.toThrow();
  });

  it("should correctly handle object updates with playing sounds", () => {
    const object: GameObject = MockGameObject.mock();
    const sound = {
      isPlaying: jest.fn(() => true),
      onSoundPlayEnded: jest.fn(),
    };

    soundsConfig.playing.set(object.id(), sound as unknown as AbstractPlayableSound);

    getManager(SoundManager).update(object.id());

    expect(sound.isPlaying).toHaveBeenCalledTimes(1);
    expect(sound.onSoundPlayEnded).toHaveBeenCalledTimes(0);
    expect(soundsConfig.playing.length()).toBe(1);
  });

  it("should correctly handle object updates with playing sounds", () => {
    const object: GameObject = MockGameObject.mock();
    const sound = {
      isPlaying: jest.fn(() => false),
      onSoundPlayEnded: jest.fn(),
    };

    soundsConfig.playing.set(object.id(), sound as unknown as AbstractPlayableSound);

    getManager(SoundManager).update(object.id());

    expect(sound.isPlaying).toHaveBeenCalledTimes(1);
    expect(sound.onSoundPlayEnded).toHaveBeenCalledTimes(1);
    expect(soundsConfig.playing.length()).toBe(0);
  });

  it("should correctly save/load data with default state", () => {
    const manager: SoundManager = getManager(SoundManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.save(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([NIL, NIL, NIL, 0, 0, 5]);

    disposeManager(SoundManager);

    const another: SoundManager = getManager(SoundManager);

    another.load(netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([]);
  });

  it("should correctly save/load data for objects", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.saveObject(object, netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([false, false, 2]);

    disposeManager(SoundManager);

    const another: SoundManager = getManager(SoundManager);

    another.loadObject(object, netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual([EPacketDataType.BOOLEAN, EPacketDataType.BOOLEAN, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([]);
  });

  it.todo("should correctly save/load with custom state");

  it.todo("should correctly initialize state for objects with statics");

  it.todo("should correctly initialize state for objects");

  it.todo("should correctly stop/start sounds for objects");

  it.todo("should correctly stop/start looped sounds for objects");

  it.todo("should correctly stop/start looped sounds for objects");

  it.todo("should correctly stop all sounds");

  it.todo("should correctly handle update event");

  it.todo("should correctly handle update event for actor");

  it.todo("should correctly handle actor going offline");
});
