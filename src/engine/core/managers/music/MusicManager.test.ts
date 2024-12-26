import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { get_console, IsDynamicMusic, level } from "xray16";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { musicConfig } from "@/engine/core/managers/music/MusicConfig";
import { MusicManager } from "@/engine/core/managers/music/MusicManager";
import { IDynamicMusicDescriptor } from "@/engine/core/managers/sounds";
import { StereoSound } from "@/engine/core/managers/sounds/objects";
import { AnyObject, Console, LuaArray } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";

describe("MusicManager", () => {
  const console: Console = get_console();
  const defaultThemes: LuaArray<IDynamicMusicDescriptor> = musicConfig.dynamicMusicThemes;

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(console.execute);
    replaceFunctionMock(IsDynamicMusic, () => true);

    musicConfig.dynamicMusicThemes = defaultThemes;
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    const manager: MusicManager = getManager(MusicManager);

    expect(manager.themes).toEqualLuaTables({});
    expect(manager.theme).toBeNull();

    expect(eventsManager.getSubscribersCount()).toBe(5);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_OFFLINE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.MAIN_MENU_ON)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.MAIN_MENU_OFF)).toBe(1);

    disposeManager(MusicManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle events", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.destroy();

    jest.spyOn(manager, "onMainMenuOff").mockImplementation(jest.fn());
    jest.spyOn(manager, "onMainMenuOn").mockImplementation(jest.fn());
    jest.spyOn(manager, "onActorUpdate").mockImplementation(jest.fn());
    jest.spyOn(manager, "onActorNetworkDestroy").mockImplementation(jest.fn());

    manager.initialize();

    EventsManager.emitEvent(EGameEvent.ACTOR_UPDATE, 500);
    expect(manager.onActorUpdate).toHaveBeenCalledWith(500);

    EventsManager.emitEvent(EGameEvent.ACTOR_GO_OFFLINE);
    expect(manager.onActorNetworkDestroy).toHaveBeenCalledTimes(1);

    EventsManager.emitEvent(EGameEvent.MAIN_MENU_OFF);
    expect(manager.onMainMenuOff).toHaveBeenCalledTimes(1);

    EventsManager.emitEvent(EGameEvent.MAIN_MENU_ON);
    expect(manager.onMainMenuOn).toHaveBeenCalledTimes(1);
  });

  it("should correctly check if theme is fading", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.themeAmbientVolume = 1;
    manager.fadeToAmbientVolume = 0;

    expect(manager.isAmbientFading()).toBe(true);

    manager.themeAmbientVolume = 0;
    manager.fadeToAmbientVolume = 0;

    expect(manager.isAmbientFading()).toBe(false);
  });

  it("should initialize themes", () => {
    const manager: MusicManager = getManager(MusicManager);

    musicConfig.dynamicMusicThemes = $fromArray<IDynamicMusicDescriptor>([
      { files: $fromArray(["first_a", "first_b"]) },
      {
        maps: "",
        files: $fromArray(["second_a", "second_b"]),
      },
      {
        maps: "zaton, jupiter",
        files: $fromArray(["third_a", "third_b"]),
      },
      {
        maps: "pripyat",
        files: $fromArray(["fourth_a", "fourth_b"]),
      },
      {
        files: $fromArray(["fifth_a"]),
      },
    ]);

    jest.spyOn(level, "name").mockImplementationOnce(() => "jupiter");

    manager.gameAmbientVolume = 0.5;
    manager.theme = new StereoSound();

    manager.initializeThemes();

    expect(manager.areThemesInitialized).toBe(true);
    expect(manager.themes.length()).toBe(4);
    expect(manager.themes).toEqualLuaArrays([
      {
        "1": "first_a",
        "2": "first_b",
      },
      {
        "1": "second_a",
        "2": "second_b",
      },
      {
        "1": "third_a",
        "2": "third_b",
      },
      {
        "1": "fifth_a",
      },
    ]);
    expect(manager.theme).toBeNull();
    expect(manager.currentThemeIndex).toBe(0);
    expect(manager.currentTrackIndex).toBe(0);
    expect(manager.nextTrackStartAt).toBe(0);

    expect(manager.themeAmbientVolume).toBe(0.5);
    expect(manager.dynamicThemeVolume).toBe(0.5);
    expect(manager.fadeToThemeVolume).toBe(0.5);
    expect(manager.fadeToAmbientVolume).toBe(0.5);
    expect(manager.volumeChangeStep).toBe(0.01);
  });

  it("should correctly select next track", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.initializeThemes();
    expect(manager.themes.length()).toBe(4);

    manager.currentThemeIndex = -1;
    expect(() => manager.selectNextTrack()).toThrow("Wrong theme index, no file with '-1' index listed.");

    manager.currentThemeIndex = 5;
    expect(() => manager.selectNextTrack()).toThrow("Wrong theme index, no file with '5' index listed.");

    manager.theme = new StereoSound();

    jest.spyOn(manager.theme, "playAtTime").mockImplementation(jest.fn(() => 7_000));

    manager.currentThemeIndex = 1;
    manager.currentTrackIndex = 1;
    manager.selectNextTrack();

    expect(manager.nextTrackStartAt).toBe(4_000);
    expect(manager.currentTrackIndex).toBe(2);
    expect(manager.theme.playAtTime).toHaveBeenCalledWith(3000, "music\\combat\\theme1_part_2", 0.5);

    manager.currentTrackIndex = 3;
    manager.selectNextTrack();

    expect(manager.currentTrackIndex).toBe(1);
    expect(manager.theme.playAtTime).toHaveBeenCalledWith(7000, "music\\combat\\theme1_part_1", 0.5);
  });

  it("should start themes", () => {
    mockRegisteredActor();

    const manager: MusicManager = getManager(MusicManager);

    manager.gameAmbientVolume = 0.75;
    jest
      .spyOn(math, "random")
      .mockImplementationOnce(() => 3)
      .mockImplementationOnce(() => 2);

    manager.initializeThemes();
    manager.startTheme();

    expect(manager.themeAmbientVolume).toBe(0);
    expect(manager.dynamicThemeVolume).toBe(0.75);
    expect(manager.currentThemeIndex).toBe(3);
    expect(manager.currentTrackIndex).toBe(2);

    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0");
    expect(manager.theme).toBeInstanceOf(StereoSound);

    jest.spyOn(manager.theme!, "initialize").mockImplementation(jest.fn());
    jest.spyOn(manager.theme!, "play").mockImplementation(() => 10_000);
    jest.spyOn(manager.theme!, "update").mockImplementation(jest.fn());

    jest
      .spyOn(math, "random")
      .mockImplementationOnce(() => 4)
      .mockImplementationOnce(() => 3);

    manager.startTheme();

    expect(manager.theme?.initialize).toHaveBeenCalledWith("music\\combat\\theme4_part_3", 0.75);
    expect(manager.theme?.play).toHaveBeenCalled();
    expect(manager.theme?.update).toHaveBeenCalledWith(0.75);

    expect(manager.nextTrackStartAt).toBe(7_000);
  });

  it.todo("should correctly check if actor is in silence zone");

  it.todo("should correctly start/stop combat music when needed");

  it.todo("should correctly update event");

  it("should correctly handle actor going offline", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.theme = new StereoSound();
    manager.gameAmbientVolume = 0.35;

    jest.spyOn(manager.theme, "stop").mockImplementation(jest.fn());

    manager.onActorNetworkDestroy();

    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0.35");
    expect(manager.theme.stop).toHaveBeenCalled();
  });

  it("should correctly handle main menu on events", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.gameAmbientVolume = 0.6;

    manager.onMainMenuOn();

    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0.6");
  });

  it("should correctly handle main menu off events", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.theme = new StereoSound();
    manager.themeAmbientVolume = 0.35;
    manager.areThemesInitialized = true;

    jest.spyOn(console, "get_float").mockImplementation(() => 0.6);
    jest.spyOn(manager.theme, "isPlaying").mockImplementation(() => true);
    jest.spyOn(manager.theme, "stop").mockImplementation(jest.fn());

    manager.onMainMenuOff();

    expect(manager.areThemesInitialized).toBe(true);
    expect(manager.gameAmbientVolume).toBe(0.6);
    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0.35");
    expect(manager.theme.stop).not.toHaveBeenCalled();

    replaceFunctionMock(IsDynamicMusic, () => false);

    manager.onMainMenuOff();

    expect(manager.areThemesInitialized).toBe(false);
    expect(manager.theme.stop).toHaveBeenCalled();
  });

  it("should correctly handle debug dump event", () => {
    const manager: MusicManager = getManager(MusicManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ MusicManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ MusicManager: expect.any(Object) });
  });
});
