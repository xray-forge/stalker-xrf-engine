import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { DIK_keys, game, get_console, IsGameTypeSingle, level, ui_events } from "xray16";

import { getManager, registerSimulator } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { DebugDialog } from "@/engine/core/ui/debug/DebugDialog";
import { LoadDialog } from "@/engine/core/ui/menu/load/LoadDialog";
import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { EMainMenuModalMode } from "@/engine/core/ui/menu/menu_types";
import { getGameSaves, loadLastGameSave } from "@/engine/core/utils/game_save";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";

jest.mock("@/engine/core/utils/game_save");

describe("MainMenu component", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(loadLastGameSave);
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

  it("should correctly load last save on click", () => {
    const menu: MainMenu = new MainMenu();

    menu.onLoadLastSaveButtonClick();

    expect(loadLastGameSave).toHaveBeenCalledTimes(1);
    expect(menu.uiModalBox.InitMessageBox).not.toHaveBeenCalled();
    expect(menu.uiModalBox.ShowDialog).not.toHaveBeenCalled();

    registerSimulator();
    mockRegisteredActor();

    menu.onLoadLastSaveButtonClick();

    expect(loadLastGameSave).toHaveBeenCalledTimes(1);
    expect(menu.modalBoxMode).toBe(EMainMenuModalMode.CONFIRM_LOAD_SAVE);
    expect(menu.uiModalBox.InitMessageBox).toHaveBeenCalledWith("message_box_confirm_load_save");
    expect(menu.uiModalBox.ShowDialog).toHaveBeenCalledWith(true);
  });

  it("should correctly handle game credits button", () => {
    const menu: MainMenu = new MainMenu();

    menu.onGameCreditsButtonClick();
    expect(game.start_tutorial).toHaveBeenCalledWith("credits_seq");
  });

  it("should correctly handle load game button", () => {
    const menu: MainMenu = new MainMenu();

    jest.spyOn(menu, "HideDialog").mockImplementation(jest.fn());
    jest.spyOn(menu, "Show").mockImplementation(jest.fn());

    replaceFunctionMock(getGameSaves, () => new LuaTable());

    expect(menu.uiGameSavesLoadDialog).toBeNull();

    menu.onLoadGameButtonClick();

    expect(menu.HideDialog).toHaveBeenCalled();
    expect(menu.Show).toHaveBeenCalledWith(false);
    expect(menu.uiGameSavesLoadDialog?.ShowDialog).toHaveBeenCalledWith(true);

    const previous: LoadDialog = menu.uiGameSavesLoadDialog as LoadDialog;

    menu.onLoadGameButtonClick();

    expect(menu.uiGameSavesLoadDialog).toBe(previous);
  });

  it("should correctly handle debug button", () => {
    const menu: MainMenu = new MainMenu();

    jest.spyOn(menu, "HideDialog").mockImplementation(jest.fn());
    jest.spyOn(menu, "Show").mockImplementation(jest.fn());

    expect(menu.uiGameDebugDialog).toBeNull();

    forgeConfig.DEBUG.IS_ENABLED = false;
    menu.onDevelopmentDebugButtonClick();

    expect(menu.uiGameDebugDialog).toBeNull();

    forgeConfig.DEBUG.IS_ENABLED = true;
    menu.onDevelopmentDebugButtonClick();

    expect(menu.HideDialog).toHaveBeenCalled();
    expect(menu.Show).toHaveBeenCalledWith(false);
    expect(menu.uiGameDebugDialog?.ShowDialog).toHaveBeenCalledWith(true);

    const previous: DebugDialog = menu.uiGameDebugDialog as DebugDialog;

    menu.onDevelopmentDebugButtonClick();

    expect(menu.uiGameDebugDialog).toBe(previous);
  });

  it("should correctly confirm click in modal boxes", () => {
    const menu: MainMenu = new MainMenu();

    menu.modalBoxMode = EMainMenuModalMode.ON;
    menu.onMessageBoxConfirmClick();

    expect(loadLastGameSave).not.toHaveBeenCalled();
    expect(menu.modalBoxMode).toBe(EMainMenuModalMode.OFF);

    menu.modalBoxMode = EMainMenuModalMode.CONFIRM_LOAD_SAVE;
    menu.onMessageBoxConfirmClick();

    expect(loadLastGameSave).toHaveBeenCalled();
    expect(menu.modalBoxMode).toBe(EMainMenuModalMode.OFF);
  });

  it("should correctly decline click in modal boxes", () => {
    const menu: MainMenu = new MainMenu();

    menu.modalBoxMode = EMainMenuModalMode.ON;
    menu.onMessageBoxDeclineClick();

    expect(menu.modalBoxMode).toBe(EMainMenuModalMode.OFF);
  });
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
