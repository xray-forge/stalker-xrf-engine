import { describe, expect, it, jest } from "@jest/globals";
import { DIK_keys, ui_events } from "xray16";

import { INumPadWindowOwner, NumPadWindow } from "@/engine/core/ui/game/NumPadWindow";

describe("NumPadWindow class", () => {
  it("should correctly initialize", () => {
    const owner: INumPadWindowOwner = { onNumberReceive: jest.fn() };
    const window: NumPadWindow = new NumPadWindow(owner);

    expect(window.owner).toBe(owner);
    expect(window.uiEditBox).toBeDefined();
  });

  it("should correctly handle OK click", () => {
    const owner: INumPadWindowOwner = { onNumberReceive: jest.fn() };
    const window: NumPadWindow = new NumPadWindow(owner);

    jest.spyOn(window, "HideDialog").mockImplementation(jest.fn());

    window.uiEditBox.TextControl().SetText("1544");

    window.onOkButtonClicked();

    expect(window.HideDialog).toHaveBeenCalledTimes(1);
    expect(owner.onNumberReceive).toHaveBeenCalledWith("1544");
  });

  it("should correctly handle cancel click", () => {
    const owner: INumPadWindowOwner = { onNumberReceive: jest.fn() };
    const window: NumPadWindow = new NumPadWindow(owner);

    jest.spyOn(window, "HideDialog").mockImplementation(jest.fn());

    window.onCancelButtonClicked();

    expect(window.HideDialog).toHaveBeenCalledTimes(1);
    expect(owner.onNumberReceive).toHaveBeenCalledWith("");
  });

  it("should correctly handle clear click", () => {
    const window: NumPadWindow = new NumPadWindow(null);

    window.uiEditBox.TextControl().SetText("1544");
    expect(window.uiEditBox.TextControl().GetText()).toBe("1544");

    window.onCButtonClicked();

    expect(window.uiEditBox.TextControl().GetText()).toBe("");
  });

  it("should correctly handle backspace click", () => {
    const window: NumPadWindow = new NumPadWindow(null);

    window.uiEditBox.TextControl().SetText("154");

    window.onBackspaceButtonClicked();
    expect(window.uiEditBox.TextControl().GetText()).toBe("15");

    window.onBackspaceButtonClicked();
    expect(window.uiEditBox.TextControl().GetText()).toBe("1");

    window.onBackspaceButtonClicked();
    expect(window.uiEditBox.TextControl().GetText()).toBe("");

    window.onBackspaceButtonClicked();
    expect(window.uiEditBox.TextControl().GetText()).toBe("");
  });

  it("should correctly handle number addition", () => {
    const window: NumPadWindow = new NumPadWindow(null);

    window.uiEditBox.TextControl().SetText("123456789");

    window.addNumber(0);
    expect(window.uiEditBox.TextControl().GetText()).toBe("1234567890");

    window.addNumber(1);
    expect(window.uiEditBox.TextControl().GetText()).toBe("12345678901");

    window.addNumber(2);
    expect(window.uiEditBox.TextControl().GetText()).toBe("123456789012");

    window.addNumber(3);
    expect(window.uiEditBox.TextControl().GetText()).toBe("123456789012");

    window.addNumber(4);
    expect(window.uiEditBox.TextControl().GetText()).toBe("123456789012");
  });

  it("should correctly handle keyboard events", () => {
    const window: NumPadWindow = new NumPadWindow(null);

    jest.spyOn(window, "addNumber").mockImplementation(jest.fn());
    jest.spyOn(window, "onBackspaceButtonClicked").mockImplementation(jest.fn());
    jest.spyOn(window, "onOkButtonClicked").mockImplementation(jest.fn());
    jest.spyOn(window, "onCButtonClicked").mockImplementation(jest.fn());
    jest.spyOn(window, "HideDialog").mockImplementation(jest.fn());

    window.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_LBUTTON_UP);
    window.OnKeyboard(DIK_keys.DIK_8, ui_events.TAB_CHANGED);

    expect(window.addNumber).toHaveBeenCalledTimes(0);
    expect(window.HideDialog).toHaveBeenCalledTimes(0);

    window.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(0);
    expect(window.HideDialog).toHaveBeenCalledTimes(1);

    window.OnKeyboard(DIK_keys.DIK_0, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD0, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(2);
    expect(window.addNumber).toHaveBeenCalledWith(0);

    window.OnKeyboard(DIK_keys.DIK_1, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD1, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(4);
    expect(window.addNumber).toHaveBeenCalledWith(1);

    window.OnKeyboard(DIK_keys.DIK_2, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD2, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(6);
    expect(window.addNumber).toHaveBeenCalledWith(2);

    window.OnKeyboard(DIK_keys.DIK_3, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD3, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(8);
    expect(window.addNumber).toHaveBeenCalledWith(3);

    window.OnKeyboard(DIK_keys.DIK_4, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD4, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(10);
    expect(window.addNumber).toHaveBeenCalledWith(4);

    window.OnKeyboard(DIK_keys.DIK_5, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD5, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(12);
    expect(window.addNumber).toHaveBeenCalledWith(5);

    window.OnKeyboard(DIK_keys.DIK_6, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD6, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(14);
    expect(window.addNumber).toHaveBeenCalledWith(6);

    window.OnKeyboard(DIK_keys.DIK_7, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD7, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(16);
    expect(window.addNumber).toHaveBeenCalledWith(7);

    window.OnKeyboard(DIK_keys.DIK_8, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD8, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(18);
    expect(window.addNumber).toHaveBeenCalledWith(8);

    window.OnKeyboard(DIK_keys.DIK_9, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPAD9, ui_events.WINDOW_KEY_PRESSED);

    expect(window.addNumber).toHaveBeenCalledTimes(20);
    expect(window.addNumber).toHaveBeenCalledWith(9);

    window.OnKeyboard(DIK_keys.DIK_BACK, ui_events.WINDOW_KEY_PRESSED);
    expect(window.onBackspaceButtonClicked).toHaveBeenCalledTimes(1);

    window.OnKeyboard(DIK_keys.DIK_RETURN, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPADENTER, ui_events.WINDOW_KEY_PRESSED);
    expect(window.onOkButtonClicked).toHaveBeenCalledTimes(2);

    window.OnKeyboard(DIK_keys.DIK_DELETE, ui_events.WINDOW_KEY_PRESSED);
    window.OnKeyboard(DIK_keys.DIK_NUMPADCOMMA, ui_events.WINDOW_KEY_PRESSED);
    expect(window.onCButtonClicked).toHaveBeenCalledTimes(2);
  });
});
