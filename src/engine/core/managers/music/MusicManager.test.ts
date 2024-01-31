import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { get_console } from "xray16";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MusicManager } from "@/engine/core/managers/music/MusicManager";
import { Console } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";

describe("MusicManager", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(console.execute);
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    const manager: MusicManager = getManager(MusicManager);

    expect(manager.themes).toEqualLuaTables({});
    expect(manager.theme).toBeNull();

    expect(eventsManager.getSubscribersCount()).toBe(4);
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

  it.todo("should initialize themes");

  it.todo("should correctly switch/select music tracks");

  it.todo("should correctly check if actor is in silence zone");

  it.todo("should correctly start/stop combat music when needed");

  it("should correctly handle main menu on events", () => {
    const manager: MusicManager = getManager(MusicManager);

    manager.gameAmbientVolume = 0.6;

    manager.onMainMenuOn();

    expect(console.execute).toHaveBeenCalledWith("snd_volume_music 0.6");
  });

  it.todo("should correctly handle main menu off events");

  it.todo("should correctly update event");

  it.todo("should correctly handle actor going offline");
});
