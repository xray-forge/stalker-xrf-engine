import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { DIK_keys, get_console, IsGameTypeSingle, level, ui_events } from "xray16";

import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { EMainMenuModalMode } from "@/engine/core/ui/menu/menu_types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";

describe("MainMenu component", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly create", () => {
    const menu: MainMenu = new MainMenu();

    expect(menu.uiGameOptionsDialog).toBeNull();
    expect(menu.uiGameSavesSaveDialog).toBeNull();
    expect(menu.uiGameSavesLoadDialog).toBeNull();
    expect(menu.uiGameDebugDialog).toBeNull();
    expect(menu.uiGameExtensionsDialog).toBeNull();

    expect(menu.modalBoxMode).toBe(EMainMenuModalMode.OFF);
  });

  it("should correctly emit event on menu show / hide", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    const menu: MainMenu = new MainMenu();

    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.MAIN_MENU_ON, menu);

    menu.close();

    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.MAIN_MENU_OFF, menu);
    expect(get_console().execute).toHaveBeenCalledWith("main_menu off");
  });

  it.todo("should correctly initialize");

  it.todo("should correctly change active modes");
});

describe("MainMenu keyboard events", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly handle Q keyboard events", () => {
    const menu: MainMenu = new MainMenu();

    jest.spyOn(menu, "onQuitGameButtonClick").mockImplementation(jest.fn());

    menu.OnKeyboard(DIK_keys.DIK_Q, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onQuitGameButtonClick).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle F11 keyboard events", () => {
    const menu: MainMenu = new MainMenu();

    jest.spyOn(menu, "onDevelopmentDebugButtonClick").mockImplementation(jest.fn());

    menu.OnKeyboard(DIK_keys.DIK_F11, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onDevelopmentDebugButtonClick).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle ESCAPE keyboard events", () => {
    const menu: MainMenu = new MainMenu();

    jest.spyOn(menu, "onReturnToGameButtonClick").mockImplementation(jest.fn());

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(0);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(actorGameObject, "alive").mockImplementation(() => false);

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(0);

    jest.spyOn(actorGameObject, "alive").mockImplementation(() => true);

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(1);

    jest.spyOn(level, "present").mockImplementation(() => false);

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(1);

    jest.spyOn(level, "present").mockImplementation(() => true);

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(2);

    jest.spyOn(actorGameObject, "alive").mockImplementation(() => false);

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(2);

    replaceFunctionMock(IsGameTypeSingle, () => false);

    menu.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(menu.onReturnToGameButtonClick).toHaveBeenCalledTimes(3);
  });
});
