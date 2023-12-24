import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { SCRIPT_SOUND_LTX, soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { NIL } from "@/engine/lib/constants/words";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

describe("SoundManager class", () => {
  beforeEach(() => {
    resetRegistry();

    soundsConfig.themes = readIniThemesList(SCRIPT_SOUND_LTX);
    soundsConfig.playing = new LuaTable();
    soundsConfig.looped = new LuaTable();
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
      EPacketDataType.STRING,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([NIL, NIL, NIL, NIL, 0, 0, 6]);

    disposeManager(SoundManager);

    const another: SoundManager = getManager(SoundManager);

    another.load(netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual([
      EPacketDataType.STRING,
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
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([false, false, false, 3]);

    disposeManager(SoundManager);

    const another: SoundManager = getManager(SoundManager);

    another.loadObject(object, netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([]);
  });

  it.todo("should correctly save/load with custom state");

  it("should correctly play sound for objects once", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    expect(() => manager.play(object.id(), "attack_end")).toThrow(
      `Not existing sound theme 'attack_end' provided for playing with object '${object.id()}'.`
    );
    expect(() => manager.play(object.id(), "looped_example")).toThrow(
      "Trying to start sound 'looped_example' with incorrect play method."
    );

    expect(soundsConfig.playing.length()).toBe(0);

    const theme: AbstractPlayableSound = soundsConfig.themes.get("attack_begin");

    jest.spyOn(theme, "play").mockImplementation(jest.fn(() => true));
    jest.spyOn(theme, "reset").mockImplementation(jest.fn());

    expect(manager.play(object.id(), "attack_begin", "faction", 1)).toBe(theme.soundObject);

    expect(soundsConfig.playing.length()).toBe(1);
    expect(theme.reset).toHaveBeenCalledTimes(0);
    expect(theme.play).toHaveBeenCalledTimes(1);
    expect(theme.play).toHaveBeenCalledWith(object.id(), "faction", 1);

    expect(manager.play(object.id(), "attack_begin", "faction", 1)).toBe(theme.soundObject);

    expect(soundsConfig.playing.length()).toBe(1);
    expect(theme.reset).toHaveBeenCalledTimes(0);
    expect(theme.play).toHaveBeenCalledTimes(1);
  });

  it("should correctly play sound for objects with forced play and reset", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    expect(soundsConfig.playing.length()).toBe(0);

    const theme: AbstractPlayableSound = soundsConfig.themes.get("play_always_example");

    jest.spyOn(theme, "play").mockImplementation(jest.fn(() => true));
    jest.spyOn(theme, "reset").mockImplementation(jest.fn());

    expect(manager.play(object.id(), "play_always_example", "faction", 1)).toBe(theme.soundObject);

    expect(soundsConfig.playing.length()).toBe(1);
    expect(theme.reset).toHaveBeenCalledTimes(0);
    expect(theme.play).toHaveBeenCalledTimes(1);
    expect(theme.play).toHaveBeenCalledWith(object.id(), "faction", 1);

    expect(manager.play(object.id(), "play_always_example", "faction", 1)).toBe(theme.soundObject);

    expect(soundsConfig.playing.length()).toBe(1);
    expect(theme.reset).toHaveBeenCalledTimes(1);
    expect(theme.play).toHaveBeenCalledTimes(2);
  });

  it("should correctly start looped sounds for objects", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    expect(() => manager.playLooped(object.id(), "attack_end")).toThrow(
      `Not existing sound theme 'attack_end' provided for loop playing with object '${object.id()}'.`
    );
    expect(() => manager.playLooped(object.id(), "play_always_example")).toThrow(
      "Trying to start sound 'play_always_example' with incorrect play looped method."
    );

    expect(soundsConfig.looped.length()).toBe(0);

    const theme: AbstractPlayableSound = soundsConfig.themes.get("looped_example");

    jest.spyOn(theme, "play").mockImplementation(jest.fn(() => true));

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.play).toHaveBeenCalledTimes(1);
    expect(theme.play).toHaveBeenCalledWith(object.id());

    jest.spyOn(theme, "isPlaying").mockImplementation(() => true);

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.play).toHaveBeenCalledTimes(1);
  });

  it("should correctly stop looped sounds for objects", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    const theme: AbstractPlayableSound = soundsConfig.themes.get("looped_example");

    jest.spyOn(theme, "play").mockImplementation(jest.fn(() => true));
    jest.spyOn(theme, "stop").mockImplementation(jest.fn(() => true));

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.play).toHaveBeenCalledTimes(1);
    expect(theme.play).toHaveBeenCalledWith(object.id());

    manager.stopLooped(object.id(), "looped_example");

    expect(theme.stop).toHaveBeenCalledTimes(0);
    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(0);

    jest.spyOn(theme, "isPlaying").mockImplementation(() => true);

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.play).toHaveBeenCalledTimes(2);

    manager.stopLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(0);
    expect(theme.stop).toHaveBeenCalledTimes(1);
  });

  it("should correctly stop all looped sounds for objects", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    const theme: AbstractPlayableSound = soundsConfig.themes.get("looped_example");

    jest.spyOn(theme, "play").mockImplementation(jest.fn(() => true));
    jest.spyOn(theme, "stop").mockImplementation(jest.fn(() => true));

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.play).toHaveBeenCalledTimes(1);
    expect(theme.play).toHaveBeenCalledWith(object.id());

    manager.stopAllLooped(object.id());

    expect(theme.stop).toHaveBeenCalledTimes(0);
    expect(soundsConfig.looped.length()).toBe(0);

    jest.spyOn(theme, "isPlaying").mockImplementation(() => true);

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.play).toHaveBeenCalledTimes(2);

    manager.stopAllLooped(object.id());

    expect(soundsConfig.looped.length()).toBe(0);
    expect(theme.stop).toHaveBeenCalledTimes(1);
  });

  it("should correctly set looped sound volume", () => {
    const manager: SoundManager = getManager(SoundManager);
    const object: GameObject = MockGameObject.mock();

    const theme: AbstractPlayableSound = soundsConfig.themes.get("looped_example");

    jest.spyOn(theme, "play").mockImplementation(jest.fn(() => true));
    jest.spyOn(theme, "stop").mockImplementation(jest.fn(() => true));
    jest.spyOn(theme, "setVolume").mockImplementation(jest.fn(() => true));

    expect(() => manager.setLoopedSoundVolume(object.id(), "looped_example", 10)).not.toThrow();

    manager.playLooped(object.id(), "looped_example");

    expect(soundsConfig.looped.length()).toBe(1);
    expect(soundsConfig.looped.get(object.id()).length()).toBe(1);
    expect(theme.setVolume).toHaveBeenCalledTimes(0);

    manager.setLoopedSoundVolume(object.id(), "looped_example", 10);

    expect(theme.setVolume).toHaveBeenCalledTimes(0);

    jest.spyOn(theme, "isPlaying").mockImplementation(() => true);

    manager.setLoopedSoundVolume(object.id(), "looped_example", 10);

    expect(theme.setVolume).toHaveBeenCalledTimes(1);
    expect(theme.setVolume).toHaveBeenCalledWith(10);
  });

  it("should correctly handle update event for actor", () => {
    const manager: SoundManager = getManager(SoundManager);

    jest.spyOn(manager, "update").mockImplementation(jest.fn());

    manager.onActorUpdate();

    expect(manager.update).toHaveBeenCalledTimes(1);
    expect(manager.update).toHaveBeenCalledWith(ACTOR_ID);
  });

  it("should correctly handle actor going offline", () => {
    const manager: SoundManager = getManager(SoundManager);

    jest.spyOn(manager, "stop").mockImplementation(jest.fn());

    manager.onActorNetworkDestroy();

    expect(manager.stop).toHaveBeenCalledTimes(1);
    expect(manager.stop).toHaveBeenCalledWith(ACTOR_ID);
  });
});
